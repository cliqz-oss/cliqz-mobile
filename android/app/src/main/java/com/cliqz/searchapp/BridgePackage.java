package com.cliqz.searchapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Nonnull;

/**
 * Copyright © Cliqz 2019
 */
public class BridgePackage implements ReactPackage {
    @Nonnull
    @Override
    public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
        return new ArrayList<>();
    }

    @Nonnull
    @Override
    @SuppressWarnings({"rawtypes"})
    public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
        final List<ViewManager> viewManagers = new ArrayList<>();
        viewManagers.add(new NativeDrawableManager());

        return viewManagers;
    }
}
