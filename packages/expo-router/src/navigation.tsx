import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { useNavigationChildren } from './routes';

// TODO: Move to different files for babel tree shaking plugin.

// This is the only way to access the navigator.
const BottomTabNavigatorUpstream = createBottomTabNavigator().Navigator;
const StackNavigatorUpstream = createStackNavigator().Navigator;
const NativeStackNavigatorUpstream = createNativeStackNavigator().Navigator;
const DrawerNavigatorUpstream = createDrawerNavigator().Navigator;

type PickPartial<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;

/** Return a navigator that automatically injects matched routes and renders nothing when there are no children. Return type with children prop optional */
function createWrappedNavigator<T extends React.ComponentType<any>>(Nav: T) {

    const Navigator = React.forwardRef((props: PickPartial<React.ComponentProps<T>, 'children'> & { order?: string[] }, ref) => {
        const children = useNavigationChildren();

        // Prevent throwing an error when there are no screens.
        if (!children.length) return null;

        // @ts-expect-error
        return <Nav {...props} ref={ref} children={children} />;
    });

    return Navigator;
}

export const Tabs = createWrappedNavigator(BottomTabNavigatorUpstream);
export const Stack = createWrappedNavigator(StackNavigatorUpstream);
export const NativeStack = createWrappedNavigator(NativeStackNavigatorUpstream);
export const Drawer = createWrappedNavigator(DrawerNavigatorUpstream);



