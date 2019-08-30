/**
 * Acquire Stream Integration Test
 *
 * Suppose we're trying to building the core stream-
 * acquisition functionality of a netflix-like video
 * streaming service.
 *
 * Before an user can start stream, we must check his
 * subscription, account restriction, our streaming-plugin
 * status, video availability on the remote server,
 * and start the stream if and only if everything is lined up
 */
const waitMS = n => new Promise(resolve => setTimeout(resolve, n));

const EXAMPLE_MOVIE = {
  id: 'sony-pic-2017',
  name: 'Emoji Movie 2',
  rating: 'pg'
};

const EXAMPLE_USER = {
  id: '666',
  name: 'Chad Masterson',
  hasSubscription: true
};

const EXAMPLE_CHILD = {
  id: '666-2',
  name: 'Beta Virginia',
  hasSubscription: true,
  restrictions: [
    'under-18'
  ]
};

class MovieServer {
  static get db() {
    return {
      'sony-pic-2017': EXAMPLE_MOVIE
    };
  }
  async request(id) {
    await waitMS(5);
    return MovieServer.db[id];
  }
}
async function startStream(movieID, userID) {

}
