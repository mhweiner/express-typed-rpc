import {test} from 'kizu';
import {serializeResponse, deserializeResponse} from './lib/serializer';

test('should serialize Date objects correctly', (assert) => {

    const testDate = new Date('2023-12-25T10:30:00.000Z');
    const serialized = serializeResponse(testDate);

    // eslint-disable-next-line no-underscore-dangle
    assert.equal(serialized.__type, 'Date', 'should have correct type marker');
    assert.equal(serialized.value, '2023-12-25T10:30:00.000Z', 'should serialize to ISO string');

});

test('should deserialize Date objects correctly', (assert) => {

    const serializedDate = {
        __type: 'Date',
        value: '2023-12-25T10:30:00.000Z',
    };

    const deserialized = deserializeResponse(serializedDate);

    assert.isTrue(deserialized instanceof Date, 'should be a Date object');
    assert.equal(deserialized.toISOString(), '2023-12-25T10:30:00.000Z', 'should have correct value');

});

test('should handle nested Date objects', (assert) => {

    const testData = {
        id: 1,
        createdAt: new Date('2023-12-25T10:30:00.000Z'),
        items: [
            {name: 'item1', date: new Date('2023-12-26T11:00:00.000Z')},
        ],
    };

    const serialized = serializeResponse(testData);
    const deserialized = deserializeResponse(serialized);

    assert.isTrue(deserialized.createdAt instanceof Date, 'nested Date should be preserved');
    assert.isTrue(deserialized.items[0].date instanceof Date, 'array Date should be preserved');
    assert.equal(deserialized.id, 1, 'non-Date values should be unchanged');

});

test('should handle null and undefined', (assert) => {

    assert.equal(serializeResponse(null), null, 'null should remain null');
    assert.equal(serializeResponse(undefined), undefined, 'undefined should remain undefined');
    assert.equal(deserializeResponse(null), null, 'null should remain null');
    assert.equal(deserializeResponse(undefined), undefined, 'undefined should remain undefined');

});
