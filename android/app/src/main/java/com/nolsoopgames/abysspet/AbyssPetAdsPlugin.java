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
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd;
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback;

@CapacitorPlugin(name = "AbyssPetAds")
public class AbyssPetAdsPlugin extends Plugin {
    private static final String TAG = "AbyssPetAds";
    private static final String SAMPLE_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
    private static final String SAMPLE_REWARDED = "ca-app-pub-3940256099942544/5224354917";
    private static final String SAMPLE_REWARDED_INTERSTITIAL =
        "ca-app-pub-3940256099942544/5354046379";
    private static final long LOAD_TIMEOUT_MS = 25000;

    private boolean sdkStarted = false;
    private boolean showing = false;

    @PluginMethod
    public void initialize(PluginCall call) {
        startSdk();
        Log.i(TAG, "initialize requested");
        call.resolve();
    }

    @PluginMethod
    public void showInterstitial(PluginCall call) {
        showFullScreen(call, Kind.INTERSTITIAL);
    }

    @PluginMethod
    public void showRewarded(PluginCall call) {
        showFullScreen(call, Kind.REWARDED);
    }

    @PluginMethod
    public void showRewardedInterstitial(PluginCall call) {
        showFullScreen(call, Kind.REWARDED_INTERSTITIAL);
    }

    private enum Kind {
        INTERSTITIAL,
        REWARDED,
        REWARDED_INTERSTITIAL
    }

    private void showFullScreen(PluginCall call, Kind kind) {
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        boolean testing = Boolean.TRUE.equals(call.getBoolean("isTesting", false));
        String adId = call.getString("adId", "");
        if (testing || adId == null || adId.isEmpty()) {
            if (kind == Kind.INTERSTITIAL) adId = SAMPLE_INTERSTITIAL;
            else if (kind == Kind.REWARDED_INTERSTITIAL) adId = SAMPLE_REWARDED_INTERSTITIAL;
            else adId = SAMPLE_REWARDED;
        }
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no activity");
            return;
        }

        Log.i(TAG, "show " + kind + " adId=" + adId + " testing=" + testing);
        showing = true;
        startSdk();

        final String unit = adId;
        final Handler handler = new Handler(Looper.getMainLooper());
        final boolean[] settled = { false };
        final boolean[] rewarded = { false };

        Runnable timeout = () -> {
            if (settled[0]) return;
            settled[0] = true;
            showing = false;
            Log.e(TAG, kind + " load timed out");
            call.reject("load timed out");
        };

        FullScreenContentCallback fullscreen = new FullScreenContentCallback() {
            @Override
            public void onAdShowedFullScreenContent() {
                Log.i(TAG, kind + " showed fullscreen");
            }

            @Override
            public void onAdDismissedFullScreenContent() {
                if (settled[0]) return;
                settled[0] = true;
                showing = false;
                JSObject ret = new JSObject();
                ret.put("shown", true);
                ret.put("rewarded", rewarded[0]);
                Log.i(TAG, kind + " dismissed rewarded=" + rewarded[0]);
                call.resolve(ret);
            }

            @Override
            public void onAdFailedToShowFullScreenContent(AdError error) {
                if (settled[0]) return;
                settled[0] = true;
                showing = false;
                Log.e(TAG, kind + " failed to show " + error);
                call.reject(error.getCode() + " " + error.getMessage());
            }
        };

        activity.runOnUiThread(() -> {
            handler.postDelayed(timeout, LOAD_TIMEOUT_MS);
            AdRequest request = new AdRequest.Builder().build();
            if (kind == Kind.INTERSTITIAL) {
                InterstitialAd.load(
                    activity,
                    unit,
                    request,
                    new InterstitialAdLoadCallback() {
                        @Override
                        public void onAdLoaded(InterstitialAd ad) {
                            if (settled[0]) return;
                            handler.removeCallbacks(timeout);
                            Log.i(TAG, "interstitial loaded, showing");
                            ad.setFullScreenContentCallback(fullscreen);
                            ad.show(activity);
                        }

                        @Override
                        public void onAdFailedToLoad(LoadAdError error) {
                            failLoad(handler, timeout, settled, call, error);
                        }
                    }
                );
                return;
            }
            if (kind == Kind.REWARDED_INTERSTITIAL) {
                RewardedInterstitialAd.load(
                    activity,
                    unit,
                    request,
                    new RewardedInterstitialAdLoadCallback() {
                        @Override
                        public void onAdLoaded(RewardedInterstitialAd ad) {
                            if (settled[0]) return;
                            handler.removeCallbacks(timeout);
                            Log.i(TAG, "rewarded interstitial loaded, showing");
                            ad.setFullScreenContentCallback(fullscreen);
                            ad.show(activity, rewardItem -> {
                                rewarded[0] = true;
                                Log.i(TAG, "user earned reward type=" + rewardItem.getType());
                            });
                        }

                        @Override
                        public void onAdFailedToLoad(LoadAdError error) {
                            failLoad(handler, timeout, settled, call, error);
                        }
                    }
                );
                return;
            }
            RewardedAd.load(
                activity,
                unit,
                request,
                new RewardedAdLoadCallback() {
                    @Override
                    public void onAdLoaded(RewardedAd ad) {
                        if (settled[0]) return;
                        handler.removeCallbacks(timeout);
                        Log.i(TAG, "rewarded loaded, showing");
                        ad.setFullScreenContentCallback(fullscreen);
                        ad.show(activity, rewardItem -> {
                            rewarded[0] = true;
                            Log.i(TAG, "user earned reward type=" + rewardItem.getType());
                        });
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError error) {
                        failLoad(handler, timeout, settled, call, error);
                    }
                }
            );
        });
    }

    private void failLoad(
        Handler handler,
        Runnable timeout,
        boolean[] settled,
        PluginCall call,
        LoadAdError error
    ) {
        handler.removeCallbacks(timeout);
        if (settled[0]) return;
        settled[0] = true;
        showing = false;
        Log.e(
            TAG,
            "failed to load code=" + error.getCode() + " domain=" + error.getDomain() + " " + error.getMessage()
        );
        call.reject(error.getCode() + " " + error.getMessage());
    }

    private void startSdk() {
        if (sdkStarted) return;
        sdkStarted = true;
        Activity activity = getActivity();
        if (activity == null) {
            Log.e(TAG, "startSdk: no activity");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                MobileAds.initialize(activity.getApplicationContext(), status -> Log.i(TAG, "MobileAds initialized"));
            } catch (Exception e) {
                Log.e(TAG, "MobileAds.initialize failed", e);
            }
        });
    }
}
