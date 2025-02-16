import 'react-native';
import React from 'react';
import App from '../App';
import { NavigationContainer } from '@react-navigation/native';
import { describe, it, expect } from '@jest/globals';
import renderer from 'react-test-renderer';
import { render } from '@testing-library/react-native';

describe('App Component', () => {
  it('renders without crashing', () => {
    expect(() => renderer.create(<App />)).not.toThrow();
  });

  it('contains NavigationContainer', () => {
    const component = renderer.create(<App />);
    const navContainer = component.root.findByType(NavigationContainer);
    expect(navContainer).toBeTruthy();
  });

  it('matches the snapshot', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders without throwing using testing-library', () => {
    expect(() => render(<App />)).not.toThrow();
  });


});
