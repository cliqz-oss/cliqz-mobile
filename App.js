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
        results: [
          {
            "url": "https://www.google.com/search?client=firefox-b&q=asd",
            "href": "https://www.google.com/search?client=firefox-b&q=asd",
            "friendlyUrl": "google.com/search?client=firefox-b&q=asd",
            "kind": [
              "custom-search"
            ],
            "provider": "instant",
            "suggestion": "asd",
            "text": "asd",
            "type": "supplementary-search",
            "meta": {
              "level": 0,
              "type": "main",
              "domain": "google.com",
              "host": "google.com",
              "hostAndPort": "google.com",
              "port": "",
              "url": "google.com/search?client=firefox-b&q=asd",
              "subType": {},
              "logo": {
                "backgroundColor": "5ea3f9",
                "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/google/$.svg)",
                "text": "go",
                "color": "#fff",
                "brandTxtColor": "5ea3f9",
                "buttonsClass": "cliqz-brands-button-6",
                "style": "background-color: #5ea3f9;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/google/$.svg); text-indent: -10em;"
              },
              "extraLogos": {},
              "externalProvidersLogos": {
                "kicker": {
                  "backgroundColor": "d7011d",
                  "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg)",
                  "text": "ki",
                  "color": "#fff",
                  "brandTxtColor": "d7011d",
                  "buttonsClass": "cliqz-brands-button-1",
                  "style": "background-color: #d7011d;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg); text-indent: -10em;"
                }
              }
            },
            "data": {
              "deepResults": [],
              "extra": {
                "mozActionUrl": "https://www.google.com/search?client=firefox-b&q=asd",
                "searchEngineName": "Google"
              },
              "kind": [
                "custom-search"
              ],
              "suggestion": "asd"
            }
          },
          {
            "url": "http://as.com/",
            "href": "http://as.com/",
            "friendlyUrl": "as.com",
            "title": "as",
            "description": "Últimas noticias de deportes en el principal diario deportivo en español.",
            "kind": [
              "m"
            ],
            "provider": "cliqz",
            "text": "as",
            "type": "bm",
            "meta": {
              "level": 0,
              "type": "main",
              "domain": "as.com",
              "host": "as.com",
              "hostAndPort": "as.com",
              "port": "",
              "url": "as.com",
              "score": 1141.6191,
              "subType": {},
              "latency": 70,
              "backendCountry": "de",
              "completion": "",
              "logo": {
                "backgroundColor": "e92207",
                "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/as/$.svg)",
                "text": "as",
                "color": "#fff",
                "brandTxtColor": "e92207",
                "buttonsClass": "cliqz-brands-button-1",
                "style": "background-color: #e92207;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/as/$.svg); text-indent: -10em;"
              },
              "extraLogos": {},
              "externalProvidersLogos": {
                "kicker": {
                  "backgroundColor": "d7011d",
                  "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg)",
                  "text": "ki",
                  "color": "#fff",
                  "brandTxtColor": "d7011d",
                  "buttonsClass": "cliqz-brands-button-1",
                  "style": "background-color: #d7011d;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg); text-indent: -10em;"
                }
              }
            },
            "data": {
              "deepResults": [],
              "extra": {
                "alternatives": [],
                "language": {},
                "og": {}
              },
              "kind": [
                "m"
              ]
            }
          },
          {
            "url": "https://as.com/futbol",
            "href": "https://as.com/futbol",
            "friendlyUrl": "as.com/futbol",
            "title": "Fútbol en AS.com",
            "description": "Fútbol en AS.com Noticias de los equipos de fútbol de 1ª y 2ª división, la Champions League y la UEFA, la Copa del Rey y la Selección Española: la liga alemana, la liga inglesa y la liga italiana. Además resultados, clasificaciones, equipos y los vídeos de la liga en As.com, el principal diario deportivo en español.",
            "kind": [
              "m"
            ],
            "provider": "cliqz",
            "text": "as",
            "type": "bm",
            "meta": {
              "level": 0,
              "type": "main",
              "domain": "as.com",
              "host": "as.com",
              "hostAndPort": "as.com",
              "port": "",
              "url": "as.com/futbol",
              "score": 488.78094,
              "subType": {},
              "latency": 70,
              "backendCountry": "de",
              "completion": "",
              "logo": {
                "backgroundColor": "e92207",
                "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/as/$.svg)",
                "text": "as",
                "color": "#fff",
                "brandTxtColor": "e92207",
                "buttonsClass": "cliqz-brands-button-1",
                "style": "background-color: #e92207;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/as/$.svg); text-indent: -10em;"
              },
              "extraLogos": {},
              "externalProvidersLogos": {
                "kicker": {
                  "backgroundColor": "d7011d",
                  "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg)",
                  "text": "ki",
                  "color": "#fff",
                  "brandTxtColor": "d7011d",
                  "buttonsClass": "cliqz-brands-button-1",
                  "style": "background-color: #d7011d;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg); text-indent: -10em;"
                }
              }
            },
            "data": {
              "deepResults": [],
              "extra": {
                "alternatives": [],
                "language": {
                  "es": 0.92
                }
              },
              "kind": [
                "m"
              ]
            }
          },
          {
            "url": "https://www.zdf.de/nachrichten/heute/aus-astana-wird-nursultan-kasachstan-benennt-hauptstadt-um-100.html",
            "href": "https://www.zdf.de/nachrichten/heute/aus-astana-wird-nursultan-kasachstan-benennt-hauptstadt-um-100.html",
            "friendlyUrl": "zdf.de/nachrichten/heute/aus-astana-wird-nursultan-kasachstan-benennt-hauptstadt-um-100.html",
            "title": "Kasachstan benennt Hauptstadt um",
            "description": "Kasachstans langjähriger Präsident Nasarbajew hat die Macht übergeben - und bleibt trotzdem einflussreich. Nun gibt es eine bemerkenswerte Entscheidung.",
            "kind": [
              "n"
            ],
            "provider": "cliqz",
            "template": "news",
            "text": "as",
            "type": "bm",
            "meta": {
              "level": 0,
              "type": "main",
              "domain": "zdf.de",
              "host": "zdf.de",
              "hostAndPort": "zdf.de",
              "port": "",
              "url": "zdf.de/nachrichten/heute/aus-astana-wird-nursultan-kasachstan-benennt-hauptstadt-um-100.html",
              "score": 1553137300,
              "subType": {},
              "latency": 70,
              "backendCountry": "de",
              "completion": "",
              "logo": {
                "backgroundColor": "ff951d",
                "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/zdf/$.svg)",
                "text": "zd",
                "color": "#fff",
                "brandTxtColor": "ff951d",
                "buttonsClass": "cliqz-brands-button-2",
                "style": "background-color: #ff951d;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/zdf/$.svg); text-indent: -10em;"
              },
              "extraLogos": {},
              "externalProvidersLogos": {
                "kicker": {
                  "backgroundColor": "d7011d",
                  "backgroundImage": "url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg)",
                  "text": "ki",
                  "color": "#fff",
                  "brandTxtColor": "d7011d",
                  "buttonsClass": "cliqz-brands-button-1",
                  "style": "background-color: #d7011d;color:#fff;background-image:url(https://cdn.cliqz.com/brands-database/database/1541686592134/logos/kicker/$.svg); text-indent: -10em;"
                }
              }
            },
            "data": {
              "deepResults": [],
              "extra": {
                "_meta": [],
                "image": {
                  "src": "https://www.zdf.de/assets/teletext-dpa-image-kasachstans-hauptstadt-wird-nach-nursultan-nasarbajew-benannt-100~1280x720?cb=1553100424019"
                },
                "media": "https://imgr.cliqz.com/7YRQqF4pnKRNX_o4qvG4FEAJNK4gR9tN_zT_Muhbb2o/fill/0/200/no/1/aHR0cHM6Ly93d3cuemRmLmRlL2Fzc2V0cy90ZWxldGV4dC1kcGEtaW1hZ2Uta2FzYWNoc3RhbnMtaGF1cHRzdGFkdC13aXJkLW5hY2gtbnVyc3VsdGFuLW5hc2FyYmFqZXctYmVuYW5udC0xMDB-MTI4MHg3MjA_Y2I9MTU1MzEwMDQyNDAxOQ.png",
                "rich_data": {
                  "breaking": false,
                  "breaking_label": null,
                  "discovery_timestamp": 1553101681,
                  "query_type": "expansion: astana",
                  "source_name": "zdf.de"
                }
              },
              "kind": [
                "n"
              ],
              "template": "news"
            }
          }
        ]
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
