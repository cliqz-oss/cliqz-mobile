package com.cliqz.searchapp;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nullable;

public class MainActivityDelegate extends ReactActivityDelegate {

    private String mQuery = null;

    MainActivityDelegate(ReactActivity activity, @Nullable String mainComponentName) {
        super(activity, mainComponentName);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Store the query, this must be done before the super class onCreate calls
        // getLaunchOptions
        final Intent intent = getPlainActivity().getIntent();
        if (intent != null && Intent.ACTION_SEARCH.equals(intent.getAction())) {
            mQuery = intent.getStringExtra(SearchManager.QUERY);
        }

        super.onCreate(savedInstanceState);
    }

    @Nullable
    @Override
    protected Bundle getLaunchOptions() {
        if (mQuery != null) {
            final Bundle options = new Bundle();
            options.putString("query", mQuery);
            return options;
        }
        return null;
    }

    @Override
    public boolean onNewIntent(Intent intent) {
        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            final String nullableQuery = intent.getStringExtra(SearchManager.QUERY);
            performSearchIfNotNull(nullableQuery);
            return true;
        }
        return super.onNewIntent(intent);
    }

    private void performSearchIfNotNull(String nullableQuery) {
        if (nullableQuery == null) {
            return;
        }

        final ReactContext context = getReactInstanceManager().getCurrentReactContext();
        try {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("performSearch", nullableQuery);
        } catch (Exception e) {
            Log.e(MainActivityDelegate.class.getSimpleName(), "Can't send events", e);
        }
    }

}
