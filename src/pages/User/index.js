import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import parse from 'parse-link-header';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  EmptyList,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    page: 1,
    lastPage: false,
  };

  async componentDidMount() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { per_page: 5 },
    });

    // Get headers to check last page
    const pageData = parse(response.headers.link);
    const lastPage = pageData ? !pageData.last : true;

    this.setState({
      stars: response.data,
      loading: false,
      lastPage,
    });
  }

  // Loads more starred projects
  loadMore = async () => {
    const { stars, page, lastPage } = this.state;

    if (!lastPage) {
      const { navigation } = this.props;
      const user = navigation.getParam('user');

      this.setState({ loading: true });

      const response = await api.get(
        `/users/${user.login}/starred?page=${page + 1}`,
        {
          params: { per_page: 5 },
        }
      );

      // Get headers to check last page
      const pageData = parse(response.headers.link);
      const last = pageData ? !pageData.last : true;

      this.setState({
        stars: [...stars, ...response.data],
        page: page + 1,
        loading: false,
        lastPage: last,
      });
    }
  };

  render() {
    const { stars, loading, lastPage } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          data={stars}
          keyExtractor={star => String(star.id)}
          onEndReachedThreshold={0.2} // Set end reach limit to trigger action
          onEndReached={!lastPage && this.loadMore} // Loads more items if not the last page
          ListFooterComponent={loading && <ActivityIndicator color="#333" />}
          ListEmptyComponent={
            !loading && <EmptyList>Nenhum repositório favorito</EmptyList>
          }
          renderItem={({ item }) => (
            <Starred>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.name}</Author>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}
