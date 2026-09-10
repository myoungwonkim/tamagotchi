# Line numbers for Play / Crashlytics stack traces
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-renamesourcefileattribute SourceFile
-keep public class * extends java.lang.Exception

# App + Capacitor bridge (JS plugin methods are looked up by name)
-keep class com.nolsoopgames.abysspet.** { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }
-keep class com.capacitorjs.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    public *;
}
-dontwarn com.getcapacitor.**

# Cordova leftover from Capacitor Android template
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# AdMob + mediation adapters
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.mediation.** { *; }
-keep class com.facebook.ads.** { *; }
-keep class com.unity3d.ads.** { *; }
-keep class com.unity3d.services.** { *; }
-keep class com.bytedance.sdk.openadsdk.** { *; }
-keep class com.getcapacitor.community.admob.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.facebook.ads.**
-dontwarn com.unity3d.**
-dontwarn com.bytedance.sdk.**

# Firebase Analytics / Crashlytics
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
