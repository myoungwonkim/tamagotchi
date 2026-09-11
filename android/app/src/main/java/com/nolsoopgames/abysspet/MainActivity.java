package com.nolsoopgames.abysspet;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;
import com.google.firebase.FirebaseApp;
import com.google.firebase.analytics.FirebaseAnalytics;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        registerPlugin(AbyssPetAdsPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            MobileAds.initialize(getApplicationContext(), status -> {});
        } catch (Exception ignored) {
            // AdMob init continues from AbyssPetAdsPlugin
        }
        // first_open / new-user counts must not wait for WebView JS.
        try {
            FirebaseApp.initializeApp(this);
            FirebaseAnalytics.getInstance(this);
        } catch (Exception ignored) {
            // google-services.json missing — gameplay still starts
        }
        // Rewarded ads: AbyssPetAdsPlugin (JS community AdMob never reached MobileAds).
    }
}
