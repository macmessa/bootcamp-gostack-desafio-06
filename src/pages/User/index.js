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
    refreshing: false,
    page: 1,
    lastPage: false,
  };

  async componentDidMount() {
    this.load();
  }

  // Load data from github api
  load = async (page = 1) => {
    const { stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${page}`,
      {
        params: { per_page: 5 },
      }
    );

    // Get headers to check last page
    const pageData = parse(response.headers.link);
    const lastPage = pageData ? !pageData.last : true;

    this.setState({
      stars: page > 1 ? [...stars, ...response.data] : response.data,
      page,
      loading: false,
      refreshing: false,
      lastPage,
    });
  };

  // Request more starred projects
  loadMore = () => {
    const { page, lastPage } = this.state;

    // If it's not the last page, loads next page
    if (!lastPage) {
      this.setState({ loading: true }, () => this.load(page + 1));
    }
  };

  // Refreshes the starred list
  refreshList = () => {
    this.setState({ refreshing: true }, this.load);
  };

  render() {
    const { stars, loading, refreshing, lastPage } = this.state;
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
          ListFooterComponent={
            loading && <ActivityIndicator size="large" color="#7159c1" />
          }
          ListEmptyComponent={
            !loading && <EmptyList>Nenhum repositório favorito</EmptyList>
          }
          refreshing={refreshing}
          onRefresh={this.refreshList}
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
