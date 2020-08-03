import "babel-polyfill";
import db from '../index';

describe("File Based JSON DB", () => {
  it("Create and read service example", async () => {
    const myId = 'Stupid Object';
    const myObject = {
      name: 'Hello!'
    };
    await db.createOrUpdateRecordById(myId, myObject);
    const newObject = await db.getRecordById(myId);
    expect(typeof newObject).toBe('object');
    expect(newObject.id).toBe(myId);
    expect(newObject.name).toBe(myObject.name);
  });
  it("Delete Record", async () => {
    const myId = 'Stupid Object';
    expect(await db.deleteRecordById.bind(null, myId)).not.toThrow();
  });
});

