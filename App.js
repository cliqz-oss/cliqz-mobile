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
  KeyboardAvoidingView,
  Linking,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Dimensions,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Cliqz from './Cliqz';
import console from 'browser-core/build/modules/core/console';
import SearchUIVertical from 'browser-core/build/modules/mobile-cards-vertical/SearchUI';
import App from 'browser-core/build/modules/core/app';
import { Provider as CliqzProvider } from 'browser-core/build/modules/mobile-cards/cliqz';
import { Provider as ThemeProvider } from 'browser-core/build/modules/mobile-cards-vertical/withTheme';
import UrlBar from './components/UrlBar';
import BackButton from './components/BackButton';

export default class instantSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      results: [],
      config: {},
      results: {
        results: []
      },
      scrollable: true,
      webViewLoaded: true,
    };
    this.scrollView = React.createRef();
    this.resultsScrollView = React.createRef();
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
      cliqz = new Cliqz(app, this.actions, this.setState.bind(this));
      this.setState({
        cliqz,
        config,
      });
      app.events.sub('search:results', (results) => {
        this.setState({ results })
      });
      cliqz.mobileCards.openLink = (url) => {
        this.scrollView.current.scrollTo({x: 0, y: Dimensions.get('screen').height, animated: true})
        this.setState({
          url,
          webViewLoaded: false,
        });
      };
    }).catch(console.log);
    DeviceEventEmitter.addListener('action', this.onAction);
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners();
  }

  search = (text) => {
    this.setState({
      text,
      url: `https://www.google.com/search?q=${text}`,
    });
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
    const hasResults = !(results.length === 0 || !this.state.cliqz || this.state.text ==='');
    const statusBarHeight = StatusBar.currentHeight;
    StatusBar.setBackgroundColor(theme.light.backgroundColor, true);
    StatusBar.setBarStyle('dark-content', true);
    return (
      <KeyboardAvoidingView style={styles.container} enabled={!hasResults}>
        <View style={styles.urlbarContainer}>
          <View style={styles.urlbarHalfBackground}/>
          <UrlBar
            value={this.state.text}
            onChanged={this.search}
            onFocus={() => {
              this.resultsScrollView.current && this.resultsScrollView.current.scrollTo({ x: 0, y: 0, animated: true, });
              this.scrollView.current && this.scrollView.current.scrollTo({ x: 0, y: 0, animated: true, });
            }}
            onClear={() => {
              this.setState({ text: '' });
            }}
            style={styles.urlbar}
          />
        </View>
        {
          !hasResults
          ? (
            // <View style={styles.noresult}>
            //   <Image source={require('./img/logo.png')} style={{width: 30, height: 30}}/>
            //   <Text style={styles.noresultText}>Powered by Cliqz search</Text>
            // </View>
            null
          )
          : (
            <ScrollView style={{ height: Dimensions.get('screen').height - statusBarHeight }}
              ref={this.scrollView}
              snapToOffsets={[Dimensions.get('screen').height ]}
              scrollEnabled={this.state.scrollable}
              onScroll={e => {
                let paddingToBottom = 10;
                paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
                  this.setState({scrollable: false})
                  // make something...
                }
              }}
            >
              <ScrollView
                style={{
                  height: Dimensions.get('screen').height - statusBarHeight,
                }}
                nestedScrollEnabled={true}
                ref={this.resultsScrollView}
              >
                <View style={{ height: 35 }} />
                <CliqzProvider value={this.state.cliqz}>
                  <ThemeProvider value={appearance}>
                    <SearchUIVertical results={results} meta={meta} theme={appearance} />
                  </ThemeProvider>
                </CliqzProvider>
                <View style={{height: 200, alignItems: 'center', justifyContent: 'center' }}>
                  <Text>
                    {this.state.url && this.state.url.startsWith('https://www.google.com/search')
                      ? `Scroll down to search Google for "${this.state.text}"`
                      : `Previous website is below`
                    }
                  </Text>
                </View>
              </ScrollView>

              <View style={{
                height: Dimensions.get('screen').height  - statusBarHeight,
                backgroundColor: theme.light.backgroundColor,
              }} >
                  {!this.state.scrollable && this.state.webViewLoaded &&
                    <BackButton
                      onPress={() => {
                        this.scrollView.current.scrollTo({x: 0, y: 0, animated: true});
                        this.resultsScrollView.current.scrollTo({x: 0, y: 0, animated: true});
                        this.setState({ scrollable: true, })
                      }}
                    />
                  }
                <WebView
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  onLoadStart={() => setTimeout(() => this.setState({ webViewLoaded: true }), 1000) }
                  style={{
                    height: Dimensions.get('screen').height  - statusBarHeight,
                    marginTop: 45,
                  }}
                  source={{uri: this.state.url}}
                />
                {!this.state.webViewLoaded &&
                  <View style={{
                    position: 'absolute',
                    backgroundColor: 'white',
                    zIndex: 1001,
                    height: Dimensions.get('screen').height,
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text>Loading..</Text>
                  </View>
                }
              </View>
            </ScrollView>
          )
        }
        { !hasResults &&
          <View style={{position: 'absolute', left: 0, right: 0, bottom: 10}}>
            <Text style={{color: '#0078CA', textAlign: 'center'}} onPress={() => Linking.openURL('https://cliqz.com/en/privacy-browser')}>Privacy policy</Text>
          </View>}
      </KeyboardAvoidingView>
    );
  }
}

const theme = {
  dark: {
    backgroundColor: 'rgba(0, 9, 23, 0.85)',
  },
  light: {
    backgroundColor: 'rgba(240, 240, 240, 1)',
  }
}

const styles = StyleSheet.create({
  urlbarContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 2000,
    width: '100%',
  },
  urlbarHalfBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    height: 45/2,
    zIndex: 1999,
    backgroundColor: theme.light.backgroundColor,
  },
  urlbar: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
    zIndex: 2000,
    backgroundColor: 'white',
    // total height is 45 = 35 (TextInput height) + 5 (marginTop) + 5 (marginBottom)
  },
  container: {
    flex: 1,
    backgroundColor: theme.light.backgroundColor,
  },
  noresult: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  noresultText: {
    marginLeft: 5,
    marginTop: 5,
  },
});
