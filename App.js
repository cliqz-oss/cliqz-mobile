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
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  TouchableHighlight,
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';
import './setup';
import Cliqz from './Cliqz';
import console from 'browser-core/build/modules/core/console';
import SearchUIVertical from 'browser-core/build/modules/mobile-cards-vertical/SearchUI';
import App from 'browser-core/build/modules/core/app';
import { Provider as CliqzProvider } from 'browser-core/build/modules/mobile-cards/cliqz';
import { Provider as ThemeProvider } from 'browser-core/build/modules/mobile-cards-vertical/withTheme';

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
    this.textInputRef = React.createRef();
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

  search(text) {
    this.setState({
      text,
      url: `https://www.google.com/search?q=${text}`,
    });
    this.state.cliqz.search.startSearch(text);
  }

  clear() {
    this.setState({text: ''});
    if (this.textInputRef.current) this.textInputRef.current.focus();
  }

  submit = () => {
    Keyboard.dismiss();
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
    return (
      <KeyboardAvoidingView style={styles.container} enabled={!hasResults}>
        <View style={styles.searchBox}>
          <View style={{flex:5}}>
            <TextInput
                autoCapitalize = 'none'
                onChangeText={this.search.bind(this)}
                onSubmitEditing={this.submit}
                placeholder="Search now"
                autoFocus={true}
                returnKeyType='done'
                onFocus={() => {
                  this.resultsScrollView.current && this.resultsScrollView.current.scrollTo({ x: 0, y: 0, animated: true, });
                  this.scrollView.current && this.scrollView.current.scrollTo({ x: 0, y: 0, animated: true, });
                }}
                style={styles.text}
                value={this.state.text}
                ref={this.textInputRef}
              />
          </View>
          {
            this.state.text !== '' && (
              <View>
                <TouchableHighlight style={styles.clear} onPress={this.clear.bind(this)}>
                  <Image source={require('./img/clear.png')} style={{width: 15, height: 15}}/>
                </TouchableHighlight>
              </View>
            )
          }
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
            <ScrollView style={{  }}
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
              <ScrollView style={{height: Dimensions.get('screen').height - 78 }} nestedScrollEnabled={true} ref={this.resultsScrollView}>
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

              <View style={{ height: Dimensions.get('screen').height  - 78 }} >
                  {!this.state.scrollable && this.state.webViewLoaded &&
                    <TouchableOpacity
                      onPress={() => {
                        this.scrollView.current.scrollTo({x: 0, y: 0, animated: true});
                        this.resultsScrollView.current.scrollTo({x: 0, y: 0, animated: true});
                        this.setState({ scrollable: true, })
                      }}

                      style={{
                        elevation: 6,
                        zIndex: 1000,
                        position: 'absolute',
                        backgroundColor: '#00AEF0',
                        height: 60,
                        width: 60,
                        right: 30,
                        bottom: 300,
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon name={'search'} size={30} color="white" />
                    </TouchableOpacity>
                  }
                <WebView
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  onLoadStart={() => setTimeout(() => this.setState({ webViewLoaded: true }), 1000) }
                  style={{ height: Dimensions.get('screen').height  - 78}}
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
    backgroundColor: 'rgba(243, 244, 245, 0.93)',
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.light.backgroundColor,
  },
  searchBox: {
    flexDirection:'row',
    height: 40,
    margin: 10,
    alignItems:'center',
    justifyContent:'center',
    borderWidth:1,
    borderColor:'#00B0F6',
    borderRadius:25,
    backgroundColor:"#fff",
  },
  text: {
    backgroundColor: 'transparent',
    paddingBottom: 0,
    paddingLeft: 20,
    paddingTop: 0,
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
  clear: {
    padding: 10,
    paddingLeft: 15,
    paddingRight: 20
  }
});
