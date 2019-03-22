/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  DeviceEventEmitter,
  NativeModules,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import './setup';
import console from 'browser-core/build/modules/core/console';
import SearchUIVertical from 'browser-core/build/modules/mobile-cards-vertical/SearchUI';
import App from 'browser-core/build/modules/core/app';
import { Provider as CliqzProvider } from 'browser-core/build/modules/mobile-cards/cliqz';
import { Provider as ThemeProvider } from 'browser-core/build/modules/mobile-cards-vertical/withTheme';

const Bridge = NativeModules.Bridge;

class Cliqz {
  constructor(app, actions) {
    this.app = app;
    this.app.modules['ui'] = {
      status() {
        return {
          name: 'ui',
          isEnabled: true,
          loadingTime: 0,
          loadingTimeSync: 0,
          windows: [],
          state: {},
        };
      },
      name: 'ui',
      action(action, ...args) {
        return Promise.resolve().then(() => {
          return actions[action](...args);
        });
      },
      isEnabled: true,
    };
    this.mobileCards = app.modules['mobile-cards'].background.actions;
    this.geolocation = app.modules['geolocation'].background.actions;
    this.search = app.modules['search'].background.actions;
    this.core = app.modules['core'].background.actions;
  }
}

type Props = {};
export default class myApp extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      results: [],
      config: {},
      results: {
        results: []
      }
    };
  }

  onAction = ({ module, action, args, id }) => {
    return this.loadingPromise.then(() => {
      return this.state.cliqz.app.modules[module].action(action, ...args).then((response) => {
        return response;
      });
    }).catch(e => console.error(e));
  }

  async componentWillMount() {
    const app = new App();
    let cliqz;
    this.loadingPromise = app.start().then(async () => {
      await app.ready();
      const config = {};//await Bridge.getConfig();
      cliqz = new Cliqz(app, this.actions);
      this.setState({
        cliqz,
        config,
      });
      app.events.sub('search:results', (results) => {
        this.setState({ results })
      });
    }).catch(console.log);
    DeviceEventEmitter.addListener('action', this.onAction);
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners();
  }

  search(text) {
    this.setState({text});
    this.state.cliqz.search.startSearch(text);
  }

  reportError = error => {
    // should not happen
    if (!this.state.cliqz) {
      return;
    }

    this.state.cliqz.core.sendTelemetry({
      type: 'error',
      source: 'react-native',
      error: JSON.stringify(error),
    });
  }

  render() {
    const results = this.state.results.results || [];
    const meta = this.state.results.meta || {};
    const appearance = 'light';
    return (
      <View style={styles.container}>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 3}}
          onChangeText={this.search.bind(this)}
          value={this.state.text}
        />
        {
          (results.length === 0) || !this.state.cliqz
          ? null
          : (
            <CliqzProvider value={this.state.cliqz}>
              <ThemeProvider value={appearance}>
                <SearchUIVertical results={results} meta={meta} theme={appearance} />
              </ThemeProvider>
            </CliqzProvider>
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
  },
});
