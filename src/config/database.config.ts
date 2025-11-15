import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    await mongoose.connect('dummy.connection.com', { dbName: 'DummyDatabase' })
  }
  catch (err) {
    console.log(`Error in Mongo DB connection - ${err}`);
    return null
  }
}

export default connectDatabase;