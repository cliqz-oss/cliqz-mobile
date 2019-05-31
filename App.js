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
  Image,
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
      resultsScrollable: true,
      webViewLoaded: true,
      isFocus: false,
    };
    this.url = '';
    this.scrollOffset = 0;
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
        this.scrollView.current && this.scrollView.current.scrollToEnd({ animated: true })
        this.currentUrl = url;
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
      scrollable: true,
      resultsScrollable: true,
      text,
    });
    this.currentUrl = `https://www.google.de/search?q=${text}`;
    if (text) {
      this.state.cliqz.search.startSearch(text);
    } else {
      this.state.cliqz.search.stopSearch();
      this.setState({ results: { results: [] }});
    }
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
    const cardListStyle = { paddingLeft: 0, paddingRight: 0 };
    StatusBar.setBackgroundColor(theme.dark.backgroundColor, true);
    StatusBar.setBarStyle('light-content', true);
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
              this.setState({ scrollable: true, resultsScrollable: true, isFocus: true });
              this.currentUrl = this.currentUrl = `https://www.google.de/search?q=${this.state.text}`;
            }}
            onBlur={() => {
              this.setState({ isFocus: false })
            }}
            onClear={() => {
              this.setState({ text: '' });
            }}
            style={styles.urlbar}
          />
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ height: Dimensions.get('window').height - statusBarHeight, }}
          ref={this.scrollView}
          snapToOffsets={[ Dimensions.get('window').height - statusBarHeight ]}
          scrollEnabled={hasResults && this.state.scrollable}
          onScroll={({ nativeEvent }) => {
            this.scrollOffset = nativeEvent.contentOffset.y;
            if (nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height) {
              this.setState({scrollable: false})
              // make something...
            }
            if (nativeEvent.contentOffset.y > 0) {
              this.setState({ resultsScrollable: false, url: this.currentUrl });
            } else {
              this.setState({ resultsScrollable: true });
            }
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{
              height: Dimensions.get('window').height - statusBarHeight,
            }}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            ref={this.resultsScrollView}
            onScrollEndDrag={({ nativeEvent }) => {
              if (this.scrollOffset > 0) {
                if (nativeEvent.velocity.y > 0.1) {
                  this.scrollView.current && this.scrollView.current.scrollTo({ x: 0, y: 0, animated: true, });
                } else {
                  this.scrollView.current && this.scrollView.current.scrollToEnd({ animated: true, });
                }
              }
            }}
          >
            <View style={{ height: 25 }} />
            <View style={{
              backgroundColor: 'white',
              flex: 1,
              marginRight: 20,
              marginLeft: 20,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              paddingTop: hasResults ? 10 : 0,
              paddingBottom: hasResults ? 10 : 0,
            }}>
            { !hasResults && this.state.isFocus ? (
              <View style={styles.noresult}>
                <Image source={require('./img/lumen.png')} style={{ alignSelf: 'center', width: 50, height: 50, marginBottom: 0, marginTop: 10, }}/>
                <Text style={styles.noresultText}>Bleib anonym mit Lumen Suche</Text>
              </View>
            ) : (
              <>
                <CliqzProvider value={this.state.cliqz}>
                  <ThemeProvider value={appearance}>
                    <SearchUIVertical
                      results={results}
                      meta={meta}
                      theme={appearance}
                      cardListStyle={cardListStyle}
                      style={{ backgroundColor: 'white' }}
                      separator={<View style={{ marginTop: 8, marginBottom: 8, backgroundColor: '#EAEAEA', height: 1 }} />}
                    />
                  </ThemeProvider>
                </CliqzProvider>
                { hasResults && (
                  <View style={{ height: 30, alignItems: 'center', justifyContent: 'flex-end', borderTopColor: '#EAEAEA', borderTopWidth: 1 }}>
                    <Text>Diese Suchantrage ist anonym</Text>
                  </View>
                )}
              </>
            )}
            </View>
            <View style={{height: 200, alignItems: 'center', justifyContent: 'flex-end' }}>
              {hasResults &&
                <>
                  <Image  source={require('./img/scroll.png')} style={{ alignSelf: 'center',  width: 30, height: 40, marginBottom: 10, marginTop: 10, flexDirection: 'column', justifyContent: 'center', }}/>
                  <Text style={{ color: '#9597A3', width: 200, textAlign: 'center', marginBottom: 20 }}>
                    Scrolle weiter um mit Google zu suchen
                  </Text>
                </>
              }
            </View>
          </ScrollView>
          <WebView
            nestedScrollEnabled={true}
            scrollEnabled={true}
            onLoadStart={() => setTimeout(() => this.setState({ webViewLoaded: true }), 1000) }
            style={{
              flex: 0,
              height: Dimensions.get('window').height - statusBarHeight - 45,
              marginTop: 45,
            }}
            source={{uri: this.state.url}}
          />
          {/* {!this.state.webViewLoaded &&
            <View style={{
              position: 'absolute',
              backgroundColor: theme.dark.backgroundColor,
              zIndex: 1001,
              height: Dimensions.get('window').height,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: '#9597A3' }}>Loading..</Text>
            </View>
          } */}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const theme = {
  dark: {
    backgroundColor: 'rgb(25, 27, 63)',
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
    backgroundColor: theme.dark.backgroundColor,
  },
  urlbar: {
    marginTop: 5,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 5,
    zIndex: 2000,
    backgroundColor: 'white',
    borderWidth: 0,
    elevation: 2,
    // total height is 45 = 35 (TextInput height) + 5 (marginTop) + 5 (marginBottom)
  },
  container: {
    flex: 1,
    backgroundColor: theme.dark.backgroundColor,
  },
  noresult: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  noresultText: {
    marginLeft: 5,
    marginTop: 5,
    width: 200,
    textAlign: 'center',
    marginBottom: 10,
    color: '#2186DB',
  },
});
