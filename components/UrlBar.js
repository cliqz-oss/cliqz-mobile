import React from 'react';
import { TextInput, View, TouchableHighlight, Image, Keyboard } from 'react-native';

export default class UrlBar extends React.Component {

  constructor(props) {
    super(props);
    this.textInputRef = React.createRef();
  }

  onClear = () => {
    if (this.textInputRef.current) {
      this.textInputRef.current.focus();
    }
    if (this.props.onClear) {
      this.props.onClear();
    }
  }

  render() {
    const { value, onChanged, onFocus, onBlur, style } = this.props;
    return (
      <View
        style={{
          flexDirection:'row',
          alignItems:'center',
          justifyContent:'center',
          borderRadius: 10,
          ...style,
        }}
      >
        <Image source={require('../img/search.png')} style={{ marginLeft: 10, width: 15, height: 15}}/>
        <View style={{ flex:5 }}>
          <TextInput
            autoCapitalize = 'none'
            onChangeText={onChanged}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            placeholder="Anonym suchen"
            placeholderTextColor="#C8C9D9"
            selectionColor="#C8C9D9"
            selectTextOnFocus={true}
            returnKeyType='done'
            onFocus={onFocus}
            onBlur={onBlur}
            style={{
              backgroundColor: 'transparent',
              paddingBottom: 0,
              paddingLeft: 5,
              paddingTop: 0,
              height: 35,
            }}
            value={value}
            ref={this.textInputRef}
          />
        </View>
        {
          value !== '' && (
            <View>
              <TouchableHighlight
                style={{
                  padding: 10,
                  paddingLeft: 15,
                  paddingRight: 15
                }}
                onPress={this.onClear}
              >
                <Image source={require('../img/clear.png')} style={{width: 15, height: 15}}/>
              </TouchableHighlight>
            </View>
          )
        }
      </View>
    );
  }
}