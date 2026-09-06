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
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

@CapacitorPlugin(name = "AbyssPetAds")
public class AbyssPetAdsPlugin extends Plugin {
    private static final String TAG = "AbyssPetAds";
    private static final String SAMPLE_REWARDED = "ca-app-pub-3940256099942544/5224354917";
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
    public void showRewarded(PluginCall call) {
        if (showing) {
            call.reject("ad already showing");
            return;
        }
        boolean testing = Boolean.TRUE.equals(call.getBoolean("isTesting", false));
        String adId = call.getString("adId", "");
        if (testing || adId == null || adId.isEmpty()) {
            adId = SAMPLE_REWARDED;
        }
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no activity");
            return;
        }

        Log.i(TAG, "showRewarded adId=" + adId + " testing=" + testing);
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
            Log.e(TAG, "load timed out");
            call.reject("load timed out");
        };

        activity.runOnUiThread(() -> {
            handler.postDelayed(timeout, LOAD_TIMEOUT_MS);
            RewardedAd.load(
                activity,
                unit,
                new AdRequest.Builder().build(),
                new RewardedAdLoadCallback() {
                    @Override
                    public void onAdLoaded(RewardedAd ad) {
                        if (settled[0]) return;
                        handler.removeCallbacks(timeout);
                        Log.i(TAG, "loaded, showing");
                        ad.setFullScreenContentCallback(
                            new FullScreenContentCallback() {
                                @Override
                                public void onAdShowedFullScreenContent() {
                                    Log.i(TAG, "showed fullscreen");
                                }

                                @Override
                                public void onAdDismissedFullScreenContent() {
                                    if (settled[0]) return;
                                    settled[0] = true;
                                    showing = false;
                                    JSObject ret = new JSObject();
                                    ret.put("shown", true);
                                    ret.put("rewarded", rewarded[0]);
                                    Log.i(TAG, "dismissed rewarded=" + rewarded[0]);
                                    call.resolve(ret);
                                }

                                @Override
                                public void onAdFailedToShowFullScreenContent(AdError error) {
                                    if (settled[0]) return;
                                    settled[0] = true;
                                    showing = false;
                                    Log.e(TAG, "failed to show " + error);
                                    call.reject(String.valueOf(error.getCode()) + " " + error.getMessage());
                                }
                            }
                        );
                        ad.show(activity, rewardItem -> {
                            rewarded[0] = true;
                            Log.i(TAG, "user earned reward type=" + rewardItem.getType());
                        });
                    }

                    @Override
                    public void onAdFailedToLoad(LoadAdError error) {
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
                }
            );
        });
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
