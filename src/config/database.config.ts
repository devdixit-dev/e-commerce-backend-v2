import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const url = process.env.DB_URL;
    const dbname = process.env.DB_NAME;

    await mongoose.connect(`${url}`, { dbName: dbname })
      .then(() => { console.log(`MongoDB Connected`) })
      .catch((e) => { console.log(`MongoDB Error - ${e}`) });
  }
  catch (err) {
    console.log(`Error in Mongo DB connection - ${err}`);
    return null
  }
}

export default connectDatabase;