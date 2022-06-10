import { EventTypeDetail } from 'event/eventType';

import { JSONSchemaEventType } from './event/implementations/jsonSchema';
import { EventStore } from './eventStore';
import { StorageAdapter } from './storageAdapter/storageAdapter';

export const mockPushEvent = jest.fn();
export const mockPushEventTransaction = jest.fn();
export const mockGetEvents = jest.fn();

export const mockStorageAdapter = new StorageAdapter({
  pushEvent: mockPushEvent,
  pushEventTransaction: mockPushEventTransaction,
  getEvents: mockGetEvents,
});

// Counters

export const counterCreatedEvent = new JSONSchemaEventType({
  type: 'COUNTER_CREATED',
});

export const counterIncrementedEvent = new JSONSchemaEventType({
  type: 'COUNTER_INCREMENTED',
});

export const counterDeletedEvent = new JSONSchemaEventType({
  type: 'COUNTER_DELETED',
});

export type CounterEventsDetails =
  | EventTypeDetail<typeof counterCreatedEvent>
  | EventTypeDetail<typeof counterIncrementedEvent>
  | EventTypeDetail<typeof counterDeletedEvent>;

export type CounterAggregate = {
  aggregateId: string;
  version: number;
  count: number;
  status: string;
};

export const counterIdMock = 'counterId';
export const counterEventsMocks: CounterEventsDetails[] = [
  {
    aggregateId: counterIdMock,
    version: 1,
    type: 'COUNTER_CREATED',
    timestamp: '2022',
  },
  {
    aggregateId: counterIdMock,
    version: 2,
    type: 'COUNTER_INCREMENTED',
    timestamp: '2023',
  },
];

export const countersReducer = (
  counterAggregate: CounterAggregate,
  event: CounterEventsDetails,
): CounterAggregate => {
  const { version, aggregateId } = event;

  switch (event.type) {
    case 'COUNTER_CREATED':
      return {
        aggregateId,
        version: event.version,
        count: 0,
        status: 'LIVE',
      };
    case 'COUNTER_INCREMENTED':
      return {
        ...counterAggregate,
        version,
        count: counterAggregate.count + 1,
      };
    case 'COUNTER_DELETED':
      return {
        ...counterAggregate,
        version,
        status: 'DELETED',
      };
  }
};

export const counterEventStore = new EventStore({
  eventStoreId: 'Counters',
  eventStoreEvents: [
    counterCreatedEvent,
    counterIncrementedEvent,
    counterDeletedEvent,
  ],
  reduce: countersReducer,
  storageAdapter: mockStorageAdapter,
});

// Users

export const userCreatedEvent = new JSONSchemaEventType({
  type: 'USER_CREATED',
  payloadSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'integer' },
    },
    required: ['name', 'age'],
    additionalProperties: false,
  } as const,
});

export const userRemovedEvent = new JSONSchemaEventType({
  type: 'USER_REMOVED',
});

export type UserEventsDetails =
  | EventTypeDetail<typeof userCreatedEvent>
  | EventTypeDetail<typeof userRemovedEvent>;

export type UserAggregate = {
  aggregateId: string;
  version: number;
  name: string;
  age: number;
  status: string;
};

export const userIdMock = 'userId';
export const userEventsMocks: UserEventsDetails[] = [
  {
    aggregateId: counterIdMock,
    version: 1,
    type: 'USER_CREATED',
    timestamp: '2022',
    payload: { name: 'Toto', age: 42 },
  },
  {
    aggregateId: counterIdMock,
    version: 2,
    type: 'USER_REMOVED',
    timestamp: '2023',
  },
];

export const usersReducer = (
  userAggregate: UserAggregate,
  event: UserEventsDetails,
): UserAggregate => {
  const { version, aggregateId } = event;

  switch (event.type) {
    case 'USER_CREATED': {
      const { name, age } = event.payload;

      return {
        aggregateId,
        version: event.version,
        name,
        age,
        status: 'CREATED',
      };
    }
    case 'USER_REMOVED':
      return {
        ...userAggregate,
        version,
        status: 'DELETED',
      };
  }
};

export const userEventStore = new EventStore({
  eventStoreId: 'Users',
  eventStoreEvents: [userCreatedEvent, userRemovedEvent],
  reduce: usersReducer,
  storageAdapter: mockStorageAdapter,
});