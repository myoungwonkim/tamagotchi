package com.nolsoopgames.abysspet;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.OnUserEarnedRewardListener;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback;
import java.util.ArrayList;
import java.util.List;

/**
 * Load and cache ads in the background. {@code showing} is true only while a
 * fullscreen ad is on screen — a pending load must not block the other slot.
 */
@CapacitorPlugin(name = "AbyssPetAds")
public class AbyssPetAdsPlugin extends Plugin {
    private static final String TAG = "AbyssPetAds";
    private static final String SAMPLE_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
    private static final String SAMPLE_REWARDED = "ca-app-pub-3940256099942544/5224354917";
    private static final String SAMPLE_REWARDED_INTERSTITIAL =
        "ca-app-pub-3940256099942544/5354046379";
    /** Keep in sync with js/adConfig.js PLAY_AD_LOAD.nativeLoadTimeoutMs */
    private static final long LOAD_TIMEOUT_MS = 25000;
    /** Keep in sync with js/adConfig.js PLAY_AD_LOAD.nativeInitTimeoutMs */
    private static final long INIT_TIMEOUT_MS = 8000;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final List<Runnable> readyWaiters = new ArrayList<>();

    private boolean sdkStarted = false;
    private boolean sdkReady = false;
    private boolean showing = false;

    private InterstitialAd interstitial;
    private boolean interstitialLoading = false;
    private PluginCall pendingInterstitialShow;

    private RewardedInterstitialAd rewardedInterstitial;
    private boolean riLoading = false;
    private PluginCall pendingRiShow;

    private RewardedAd rewarded;
    private boolean rewardedLoading = false;
    private PluginCall pendingRewardedShow;

    @PluginMethod
    public void initialize(PluginCall call) {
        startSdk(() -> {
            Log.i(TAG, "initialize ready");
            call.resolve();
        });
    }

    @PluginMethod
    public void preloadInterstitial(PluginCall call) {
        String unit = unitId(call, Kind.INTERSTITIAL);
        startSdk(() -> {
            loadInterstitial(unit, null);
            call.resolve();
        });
    }

    @PluginMethod
    public void preloadRewardedInterstitial(PluginCall call) {
        String unit = unitId(call, Kind.REWARDED_INTERSTITIAL);
        startSdk(() -> {
            loadRewardedInterstitial(unit, null);
            call.resolve();
        });
    }

    @PluginMethod
    public void preloadRewarded(PluginCall call) {
        String unit = unitId(call, Kind.REWARDED);
        startSdk(() -> {
            loadRewarded(unit, null);
            call.resolve();
        });
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        String unit = unitId(call, Kind.INTERSTITIAL);
        startSdk(() -> showOrLoadInterstitial(call, unit));
    }

    @PluginMethod
    public void showRewardedInterstitial(PluginCall call) {
        String unit = unitId(call, Kind.REWARDED_INTERSTITIAL);
        startSdk(() -> showOrLoadRi(call, unit));
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        String unit = unitId(call, Kind.REWARDED);
        startSdk(() -> showOrLoadRewarded(call, unit));
    }

    private enum Kind {
        INTERSTITIAL,
        REWARDED,
        REWARDED_INTERSTITIAL
    }

    private String unitId(PluginCall call, Kind kind) {
        boolean testing = Boolean.TRUE.equals(call.getBoolean("isTesting", false));
        String adId = call.getString("adId", "");
        if (testing || adId == null || adId.isEmpty()) {
            if (kind == Kind.INTERSTITIAL) return SAMPLE_INTERSTITIAL;
            if (kind == Kind.REWARDED_INTERSTITIAL) return SAMPLE_REWARDED_INTERSTITIAL;
            return SAMPLE_REWARDED;
        }
        return adId;
    }

    private void startSdk(Runnable onReady) {
        Activity activity = getActivity();
        if (activity == null) {
            onReady.run();
            return;
        }
        if (sdkReady) {
            activity.runOnUiThread(onReady);
            return;
        }
        readyWaiters.add(onReady);
        if (sdkStarted) return;
        sdkStarted = true;
        activity.runOnUiThread(() -> {
            Runnable timeout = () -> {
                if (sdkReady) return;
                Log.w(TAG, "MobileAds initialize timed out; trying loads anyway");
                markSdkReady();
            };
            mainHandler.postDelayed(timeout, INIT_TIMEOUT_MS);
            try {
                MobileAds.initialize(
                    activity.getApplicationContext(),
                    status -> {
                        mainHandler.removeCallbacks(timeout);
                        Log.i(TAG, "MobileAds initialized");
                        markSdkReady();
                    }
                );
            } catch (Exception e) {
                mainHandler.removeCallbacks(timeout);
                Log.e(TAG, "MobileAds.initialize failed", e);
                markSdkReady();
            }
        });
    }

    private void markSdkReady() {
        sdkReady = true;
        List<Runnable> waiters = new ArrayList<>(readyWaiters);
        readyWaiters.clear();
        Activity activity = getActivity();
        Runnable runAll = () -> {
            for (Runnable waiter : waiters) waiter.run();
        };
        if (activity != null) activity.runOnUiThread(runAll);
        else mainHandler.post(runAll);
    }

    private void showOrLoadInterstitial(PluginCall call, String unit) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no activity");
            return;
        }
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        if (pendingInterstitialShow != null) {
            call.reject("interstitial already pending");
            return;
        }
        if (interstitial != null) {
            presentInterstitial(call);
            return;
        }
        pendingInterstitialShow = call;
        if (interstitialLoading) {
            watchLoad(call, LOAD_TIMEOUT_MS);
            return;
        }
        loadInterstitial(unit, call);
    }

    private void showOrLoadRi(PluginCall call, String unit) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no activity");
            return;
        }
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        if (pendingRiShow != null) {
            call.reject("rewarded interstitial already pending");
            return;
        }
        if (rewardedInterstitial != null) {
            presentRi(call);
            return;
        }
        pendingRiShow = call;
        if (riLoading) {
            watchLoad(call, LOAD_TIMEOUT_MS);
            return;
        }
        loadRewardedInterstitial(unit, call);
    }

    private void showOrLoadRewarded(PluginCall call, String unit) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no activity");
            return;
        }
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        if (pendingRewardedShow != null) {
            call.reject("rewarded already pending");
            return;
        }
        if (rewarded != null) {
            presentRewarded(call);
            return;
        }
        pendingRewardedShow = call;
        if (rewardedLoading) {
            watchLoad(call, LOAD_TIMEOUT_MS);
            return;
        }
        loadRewarded(unit, call);
    }

    private void watchLoad(PluginCall call, long timeoutMs) {
        mainHandler.postDelayed(() -> {
            if (call == pendingInterstitialShow) {
                interstitialLoading = false;
                failPending(call, "load timed out");
            } else if (call == pendingRiShow) {
                riLoading = false;
                failPending(call, "load timed out");
            } else if (call == pendingRewardedShow) {
                rewardedLoading = false;
                failPending(call, "load timed out");
            }
        }, timeoutMs);
    }

    private void loadInterstitial(String unit, PluginCall showCall) {
        Activity activity = getActivity();
        if (activity == null) {
            failPending(showCall, "no activity");
            return;
        }
        if (interstitial != null || interstitialLoading) return;
        interstitialLoading = true;
        Log.i(TAG, "load interstitial " + unit);
        Runnable timeout = () -> {
            if (!interstitialLoading) return;
            interstitialLoading = false;
            Log.e(TAG, "interstitial load timed out");
            failPending(showCall, "load timed out");
        };
        if (showCall != null) mainHandler.postDelayed(timeout, LOAD_TIMEOUT_MS);
        AdRequest request = new AdRequest.Builder().build();
        InterstitialAd.load(
            activity,
            unit,
            request,
            new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(InterstitialAd ad) {
                    mainHandler.removeCallbacks(timeout);
                    interstitialLoading = false;
                    interstitial = ad;
                    Log.i(TAG, "interstitial loaded");
                    if (pendingInterstitialShow != null) presentInterstitial(pendingInterstitialShow);
                }

                @Override
                public void onAdFailedToLoad(LoadAdError error) {
                    mainHandler.removeCallbacks(timeout);
                    interstitialLoading = false;
                    interstitial = null;
                    Log.e(TAG, "interstitial failed " + error.getCode() + " " + error.getMessage());
                    failPending(
                        showCall != null ? showCall : pendingInterstitialShow,
                        error.getCode() + " " + error.getMessage()
                    );
                }
            }
        );
    }

    private void loadRewardedInterstitial(String unit, PluginCall showCall) {
        Activity activity = getActivity();
        if (activity == null) {
            failPending(showCall, "no activity");
            return;
        }
        if (rewardedInterstitial != null || riLoading) return;
        riLoading = true;
        Log.i(TAG, "load rewarded interstitial " + unit);
        Runnable timeout = () -> {
            if (!riLoading) return;
            riLoading = false;
            Log.e(TAG, "rewarded interstitial load timed out");
            failPending(showCall, "load timed out");
        };
        if (showCall != null) mainHandler.postDelayed(timeout, LOAD_TIMEOUT_MS);
        AdRequest request = new AdRequest.Builder().build();
        RewardedInterstitialAd.load(
            activity,
            unit,
            request,
            new RewardedInterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(RewardedInterstitialAd ad) {
                    mainHandler.removeCallbacks(timeout);
                    riLoading = false;
                    rewardedInterstitial = ad;
                    Log.i(TAG, "rewarded interstitial loaded");
                    if (pendingRiShow != null) presentRi(pendingRiShow);
                }

                @Override
                public void onAdFailedToLoad(LoadAdError error) {
                    mainHandler.removeCallbacks(timeout);
                    riLoading = false;
                    rewardedInterstitial = null;
                    Log.e(TAG, "rewarded interstitial failed " + error.getCode() + " " + error.getMessage());
                    failPending(
                        showCall != null ? showCall : pendingRiShow,
                        error.getCode() + " " + error.getMessage()
                    );
                }
            }
        );
    }

    private void loadRewarded(String unit, PluginCall showCall) {
        Activity activity = getActivity();
        if (activity == null) {
            failPending(showCall, "no activity");
            return;
        }
        if (rewarded != null || rewardedLoading) return;
        rewardedLoading = true;
        Log.i(TAG, "load rewarded " + unit);
        Runnable timeout = () -> {
            if (!rewardedLoading) return;
            rewardedLoading = false;
            Log.e(TAG, "rewarded load timed out");
            failPending(showCall, "load timed out");
        };
        if (showCall != null) mainHandler.postDelayed(timeout, LOAD_TIMEOUT_MS);
        AdRequest request = new AdRequest.Builder().build();
        RewardedAd.load(
            activity,
            unit,
            request,
            new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(RewardedAd ad) {
                    mainHandler.removeCallbacks(timeout);
                    rewardedLoading = false;
                    rewarded = ad;
                    Log.i(TAG, "rewarded loaded");
                    if (pendingRewardedShow != null) presentRewarded(pendingRewardedShow);
                }

                @Override
                public void onAdFailedToLoad(LoadAdError error) {
                    mainHandler.removeCallbacks(timeout);
                    rewardedLoading = false;
                    rewarded = null;
                    Log.e(TAG, "rewarded failed " + error.getCode() + " " + error.getMessage());
                    failPending(
                        showCall != null ? showCall : pendingRewardedShow,
                        error.getCode() + " " + error.getMessage()
                    );
                }
            }
        );
    }

    private void presentInterstitial(PluginCall call) {
        Activity activity = getActivity();
        InterstitialAd ad = interstitial;
        interstitial = null;
        pendingInterstitialShow = null;
        if (activity == null || ad == null) {
            call.reject("no interstitial");
            return;
        }
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        showing = true;
        final boolean[] rewarded = { false };
        ad.setFullScreenContentCallback(fullscreen(call, rewarded, "interstitial"));
        ad.show(activity);
    }

    private void presentRi(PluginCall call) {
        Activity activity = getActivity();
        RewardedInterstitialAd ad = rewardedInterstitial;
        rewardedInterstitial = null;
        pendingRiShow = null;
        if (activity == null || ad == null) {
            call.reject("no rewarded interstitial");
            return;
        }
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        showing = true;
        final boolean[] rewardedFlag = { false };
        ad.setFullScreenContentCallback(fullscreen(call, rewardedFlag, "rewarded interstitial"));
        ad.show(activity, (OnUserEarnedRewardListener) rewardItem -> {
            rewardedFlag[0] = true;
            Log.i(TAG, "user earned reward type=" + rewardItem.getType());
        });
    }

    private void presentRewarded(PluginCall call) {
        Activity activity = getActivity();
        RewardedAd ad = rewarded;
        rewarded = null;
        pendingRewardedShow = null;
        if (activity == null || ad == null) {
            call.reject("no rewarded");
            return;
        }
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        showing = true;
        final boolean[] rewardedFlag = { false };
        ad.setFullScreenContentCallback(fullscreen(call, rewardedFlag, "rewarded"));
        ad.show(activity, rewardItem -> {
            rewardedFlag[0] = true;
            Log.i(TAG, "user earned reward type=" + rewardItem.getType());
        });
    }

    private FullScreenContentCallback fullscreen(
        PluginCall call,
        boolean[] rewarded,
        String kind
    ) {
        return new FullScreenContentCallback() {
            private boolean settled = false;

            @Override
            public void onAdShowedFullScreenContent() {
                Log.i(TAG, kind + " showed fullscreen");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                finishShow(call, rewarded[0], kind, null);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(AdError error) {
                finishShow(call, false, kind, error.getCode() + " " + error.getMessage());
            }

            private void finishShow(PluginCall showCall, boolean earned, String label, String error) {
                if (settled) return;
                settled = true;
                showing = false;
                if (error != null) {
                    Log.e(TAG, label + " failed to show " + error);
                    showCall.reject(error);
                    return;
                }
                JSObject ret = new JSObject();
                ret.put("shown", true);
                ret.put("rewarded", earned);
                Log.i(TAG, label + " dismissed rewarded=" + earned);
                showCall.resolve(ret);
            }
        };
    }

    private void failPending(PluginCall showCall, String message) {
        if (showCall == pendingInterstitialShow) pendingInterstitialShow = null;
        if (showCall == pendingRiShow) pendingRiShow = null;
        if (showCall == pendingRewardedShow) pendingRewardedShow = null;
        if (showCall != null) showCall.reject(message);
    }
}
