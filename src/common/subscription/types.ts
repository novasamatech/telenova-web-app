export type SubscriptionState<T> = {
    current?: T;
    updaters: Record<number, (value: T) => void>;
    unsubscribe?: () => void;
}