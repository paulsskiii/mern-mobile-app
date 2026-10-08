import { Provider } from 'react-redux';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import ProductListScreen from '../screens/ProductListScreen';
import { store } from '../store';
import { products } from '../data/products';

jest.mock('../services/products', () => ({
  fetchProducts: jest.fn(),
}));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'trainee@shopfront.test' }, status: 'signedIn' }),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({ name: 'Products', params: undefined }),
  useNavigation: () => ({ navigate: jest.fn(), dispatch: jest.fn() }),
}));

const { fetchProducts } = require('../services/products');

let mockCardRenders = 0;
beforeEach(() => {
  mockCardRenders = 0;
  jest.spyOn(console, 'log').mockImplementation((tag, name) => {
    if (tag === '[render]' && name === 'ProductCard') mockCardRenders += 1;
  });
});
afterEach(() => jest.restoreAllMocks());

async function mountScreen() {
  fetchProducts.mockResolvedValue(products);
  render(
    <Provider store={store}>
      <ProductListScreen navigation={{ navigate: jest.fn(), dispatch: jest.fn() }} />
    </Provider>
  );
  await waitFor(() => expect(screen.getByText('Canvas Tote Bag')).toBeTruthy());
}

test('adding to the cart does not re-render the cards', async () => {
  await mountScreen();
  const user = userEvent.setup();
  mockCardRenders = 0;
  await user.press(screen.getAllByText('Add')[0]);
  await waitFor(() => expect(screen.getByText(/added to cart/)).toBeTruthy());
  expect(mockCardRenders).toBe(0);
});

test('typing in search does not re-render cards that stay visible', async () => {
  await mountScreen();
  const user = userEvent.setup();
  mockCardRenders = 0;
  await user.type(screen.getByPlaceholderText('Search products'), 'a');
  expect(mockCardRenders).toBe(0);
});
