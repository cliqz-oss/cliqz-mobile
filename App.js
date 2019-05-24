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
  StyleSheet,
  Text,
  ScrollView,
  View,
  Dimensions,
  StatusBar,
  Keyboard,
  Animated,
  PanResponder,
  TouchableWithoutFeedback
} from 'react-native';
import { WebView } from 'react-native-webview';
import Cliqz from './Cliqz';
import console from 'browser-core/build/modules/core/console';
import SearchUIVertical from 'browser-core/build/modules/mobile-cards-vertical/SearchUI';
import App from 'browser-core/build/modules/core/app';
import { Provider as CliqzProvider } from 'browser-core/build/modules/mobile-cards/cliqz';
import { Provider as ThemeProvider } from 'browser-core/build/modules/mobile-cards-vertical/withTheme';
import UrlBar from './components/UrlBar';

const LIMIT_UP = 10;
const URLBAR_HEIGHT = 65;
const SEARCH__BUTTON_HEIGHT = 50;


export default class instantSearch extends React.Component {
  constructor(props) {
    super(props);
    const statusBarHeight = StatusBar.currentHeight;
    const windowHeight = Dimensions.get('window').height - statusBarHeight
    this.isUrlbarDown = true;
    this.state = {
      isAnimating: false,
      searchButtonVisible: false,
      url: 'https://lumenbrowser.com',
      windowHeight,
      touched: false,
      position: new Animated.Value(windowHeight - URLBAR_HEIGHT),
      text: '',
      results: [],
      config: {},
      results: {
        results: []
      },
      scrollable: true,
      webViewLoaded: true,
      serpMessage: 'keep scrolling to go to google...',
    };
    this.drawerRef = React.createRef();
    this.urlbarRef = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextState.isAnimating;
  }

  onAction = ({ module, action, args, id }) => {
    return this.loadingPromise.then(() => {
      return this.app.modules[module].action(action, ...args).then((response) => {
        return response;
      });
    }).catch(e => console.error(e));
  }

  moveDrawerView(gestureState) {
    if (!this.drawerRef.current) return;
    const position = gestureState.moveY;
    this.updatePosition(position);
  }

  sendUrlbarToTop({ v0, noAnimation } = {}) {
    this.isUrlbarDown = false;
    if (noAnimation) {
      this.updatePosition(LIMIT_UP);
    } else {
      this.animateToPosition(LIMIT_UP, v0);
    }
  }

  sendUrlbarToBottom({ v0, noAnimation } = {}) {
    this.isUrlbarDown = true;
    if (noAnimation) {
      this.updatePosition(this.state.windowHeight - URLBAR_HEIGHT);
    } else {
      this.animateToPosition(this.state.windowHeight - URLBAR_HEIGHT, v0);
    }
  }

  moveFinished(gestureState) {
    if (!this.drawerRef.current) return;
      const isGoingUp = gestureState.vy < 0;
      if (isGoingUp) {
        this.sendUrlbarToTop({ v0: gestureState.vy });
      } else {
        this.sendUrlbarToBottom({ v0: gestureState.vy });
        Keyboard.dismiss();
      }
  }

  isAValidMovement = ({ dx, dy, moveY }) => {
    const moveTravelledFarEnough =
    Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 2;
    const notTooHigh = moveY >= LIMIT_UP;
    const notTooLow = moveY <= this.state.windowHeight - URLBAR_HEIGHT;
    return moveTravelledFarEnough && notTooHigh && notTooLow;
  }

  updatePosition(position) {
    this.state.position.setValue(position);
  }

  animateToPosition(position, v0 = 20) {
    this.setState({ isAnimating: true });
    Animated.spring(this.state.position, {
      toValue: position,
      velocity: v0,
      speed: 16,
      bounciness: 6,
    }).start(() => this.setState({ isAnimating: false }));
  }

  componentWillMount() {
    this._panGesture = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
            this.state.touched
        );
      },
      onPanResponderMove: (evt, gestureState) => {
          if (this.isAValidMovement(gestureState)) {
            this.moveDrawerView(gestureState);
          }
      },
      onPanResponderRelease: (evt, gestureState) => {
          this.moveFinished(gestureState);
      }
    });
    this.app = new App();
    let cliqz;
    this.loadingPromise = this.app.start().then(async () => {
      await this.app.ready();
      const config = {};//await Bridge.getConfig();
      cliqz = new Cliqz(this.app, this.actions, this.setState.bind(this));
      this.setState({
        cliqz,
        config,
      });
      this.app.events.sub('search:results', (results) => {
        this.setState({ results })
      });
      cliqz.mobileCards.openLink = (url) => {
        this.setState({
          url,
          webViewLoaded: false,
        });
        this.sendUrlbarToBottom();
      };
    }).catch(console.log);
    DeviceEventEmitter.addListener('action', this.onAction);
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.keyboardDidChangeFrameListener.remove();
  }

  _keyboardDidShow = () => {
    this.setState({ searchButtonVisible: false })
  }

  _keyboardDidHide = () => {
    this.setState({ searchButtonVisible: true })
  }

  search = async (text) => {
    await this.setState({
      text,
    });
    if (text && this.isUrlbarDown) {
      this.sendUrlbarToTop();
    }
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
    StatusBar.setBackgroundColor(theme.light.backgroundColor, true);
    StatusBar.setBarStyle('dark-content', true);
    let resultsHeight = this.state.windowHeight - URLBAR_HEIGHT - LIMIT_UP;
    if (this.state.searchButtonVisible) {
      resultsHeight -= SEARCH__BUTTON_HEIGHT;
    }
    return (
      <View
        style={styles.container} 
        enabled={!hasResults}
        onLayout={async (e) => {
          await this.setState({ windowHeight: e.nativeEvent.layout.height });
          if (this.isUrlbarDown) {
            // update urlbar's position if it was down
            this.sendUrlbarToBottom({ noAnimation: true });
          }
        }}
      >
        <WebView
          style={{ marginBottom: URLBAR_HEIGHT }}
          source={{uri: this.state.url}}
          onTouchStart={() => {
            if (this.urlbarRef.current) {
              this.urlbarRef.current.blur();
            }
          }}
          onLoadEnd={({nativeEvent: { url, title }}) => 
            this.app.events.pub('history:add', {
              url,
              title,
              lastVisitDate: Date.now()
            })
          }
        />
        <Animated.View
          style={[styles.urlbarContainer, { top: this.state.position }]}
          ref={this.drawerRef}
          {...this._panGesture.panHandlers}
        >
          <TouchableWithoutFeedback
            onPressIn={() => this.setState({touched: true})}
            onPressOut={() => this.setState({touched: false})}
          >
            <View>
              <View style={styles.notch} />
              <UrlBar
                value={this.state.text}
                onChanged={this.search}
                onFocus={() => {}}
                onClear={() => {
                  this.setState({ text: '' });
                }}
                style={styles.urlbar}
                ref={this.urlbarRef}
              />
            </View>
          </TouchableWithoutFeedback>
          <ScrollView
            style={{ height: resultsHeight}}
          >
            <CliqzProvider value={this.state.cliqz}>
              <ThemeProvider value={appearance}>
                <SearchUIVertical results={results} meta={meta} theme={appearance} />
              </ThemeProvider>
            </CliqzProvider>
          </ScrollView>
          { this.state.searchButtonVisible &&
            <TouchableWithoutFeedback onPress={() => this.state.cliqz.mobileCards.openLink(`https://www.google.com/search?q=${this.state.text}`)}>
              <View style={{ height: SEARCH__BUTTON_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                <Text>search google</Text>
              </View>
            </TouchableWithoutFeedback>
          }
        </Animated.View>
      </View>
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
  notch: {
    marginTop: 15,
    width: 50,
    height: 5,
    backgroundColor: 'rgb(90, 90, 90)',
    alignSelf: 'center',
  },
  urlbarContainer: {
    position: 'absolute',
    zIndex: 2000,
    width: '100%',
    backgroundColor: theme.light.backgroundColor,
  },
  urlbar: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 5,
    zIndex: 2000,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: theme.light.backgroundColor,
  },
});
