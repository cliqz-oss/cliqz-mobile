import React from 'react';
import { TextInput, View, TouchableHighlight, Image, Keyboard } from 'react-native';

export default class UrlBar extends React.Component {

  constructor(props) {
    super(props);
    this.textInputRef = React.createRef();
  }

  blur() {
    if (this.textInputRef.current) {
      this.textInputRef.current.blur();
    }
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
    const { value, onChanged, onFocus, style } = this.props;
    return (
      <View
        style={{
          flexDirection:'row',
          alignItems:'center',
          justifyContent:'center',
          borderWidth:1,
          borderColor:'#00B0F6',
          borderRadius:25,
          ...style,
        }}
      >
        <View style={{ flex:5 }}>
          <TextInput
            autoCapitalize = 'none'
            onChangeText={onChanged}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            placeholder="Search now"
            returnKeyType='done'
            onFocus={onFocus}
            style={{
              backgroundColor: 'transparent',
              paddingBottom: 0,
              paddingLeft: 15,
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