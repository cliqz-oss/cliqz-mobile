/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  TouchableHighlight,
  DeviceEventEmitter,
  Image,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';
import './setup';
import Cliqz from './Cliqz';
import console from 'browser-core/build/modules/core/console';
import SearchUIVertical from 'browser-core/build/modules/mobile-cards-vertical/SearchUI';
import App from 'browser-core/build/modules/core/app';
import { Provider as CliqzProvider } from 'browser-core/build/modules/mobile-cards/cliqz';
import { Provider as ThemeProvider } from 'browser-core/build/modules/mobile-cards-vertical/withTheme';

type Props = {};
export default class instantSearch extends React.Component<Props> {
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

  clear() {
    this.setState({text: ''});
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
        <View style={styles.searchBox}>
          <View style={{flex:5}}>
            <TextInput
                onChangeText={this.search.bind(this)}
                placeholder="Start here"
                autoFocus={true}
                style={styles.text}
                value={this.state.text}
              />
          </View>
          {
            this.state.text !== '' && (
              <View>
                <TouchableHighlight style={styles.clear} onPress={this.clear.bind(this)}>
                  <Text style={{fontWeight: 'bold'}}>x</Text>
                </TouchableHighlight>
              </View>
            )
          }
        </View>
        {
          results.length === 0 || !this.state.cliqz || this.state.text ===''
          ? (
            <View style={styles.noresult}>
              <Image source={require('./img/logo.png')} style={{width: 30, height: 30}}/>
              <Text style={styles.noresultText}>Powered by Cliqz search</Text>
            </View>
          )
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
  },
  searchBox: {
    flexDirection:'row',
    height: 40,
    margin: 10,
    alignItems:'center',
    justifyContent:'center',
    borderWidth:1,
    borderColor:'#888',
    borderRadius:25,
    backgroundColor:"#fff",
  },
  text: {
    backgroundColor: 'transparent',
    paddingLeft: 20,
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
