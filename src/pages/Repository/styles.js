import styled from 'styled-components/native';
import { WebView } from 'react-native-webview';

export const Browser = styled(WebView)`
  flex: 1;
  border: 1px solid red;
`;

export const Loader = styled.ActivityIndicator.attrs({
  size: 'large',
  color: '#7159c1',
})`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;
