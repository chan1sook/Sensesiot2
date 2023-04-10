import { ObjectId } from "mongodb";
import isURL from "validator/lib/isURL.js";
import { sensesiotBase } from "../database/mongodb.js";
import {
  pathJoinBucket,
  sensesiotBucket,
} from "../database/firebase-storage.js";

export async function getSensesiotNews(
  { limit, onlyPublish = false } = {
    limit: undefined,
    onlyPublish: false,
  }
) {
  const newsCol = sensesiotBase.collection("news");
  const query = onlyPublish ? { published: true } : {};
  let dbQuery = newsCol.find(query).sort({ createTime: -1 });
  if (limit) {
    dbQuery = dbQuery.limit(limit);
  }

  const newsDocs = await dbQuery.toArray();
  const result = newsDocs.map((ele) => ({
    ...ele,
    publicImgUrl: sensesiotBucket()
      .file(pathJoinBucket("newsImages", ele.imgSrc))
      .publicUrl(),
  }));

  return result;
}

export async function getSensesiotNewsById(newsId) {
  const newsCol = sensesiotBase.collection("news");
  const newsDoc = await newsCol.findOne({
    _id: ObjectId(newsId),
  });

  if (!newsDoc) {
    throw new Error("No News Found");
  }
  newsDoc.publicImgUrl = sensesiotBucket()
    .file(pathJoinBucket("newsImages", newsDoc.imgSrc))
    .publicUrl();

  return newsDoc;
}

export async function createSensesiotNews({
  name = "",
  description = "",
  imgSrc = "",
  link = "",
  published = false,
}) {
  const newsCol = sensesiotBase.collection("news");

  if (link && !isURL(link)) {
    throw new Error("Link Invalid");
  }

  const today = new Date();

  const data = {
    name,
    description,
    imgSrc,
    link,
    published,
    createTime: today,
    lastestUpdateTime: today,
  };

  const { insertedId } = await newsCol.insertOne(data);
  return {
    _id: insertedId,
    ...data,
    publicImgUrl: sensesiotBucket()
      .file(pathJoinBucket("newsImages", data.imgSrc))
      .publicUrl(),
  };
}

export async function updateSensesiotNews(newsId, data) {
  const newsCol = sensesiotBase.collection("news");
  const { value } = await newsCol.findOneAndUpdate(
    {
      _id: ObjectId(newsId),
    },
    {
      $set: { ...data, lastestUpdateTime: new Date() },
    },
    { returnDocument: "after" }
  );

  if (!value) {
    throw new Error("Forbidden");
  }
  value.publicImgUrl = sensesiotBucket()
    .file(pathJoinBucket("newsImages", data.imgSrc))
    .publicUrl();

  return value;
}

export function removeSensesiotNews(newsId) {
  const newsCol = sensesiotBase.collection("news");

  return newsCol.findOneAndDelete({
    _id: ObjectId(newsId),
  });
}

export default Object.freeze({
  getSensesiotNews,
  getSensesiotNewsById,
  createSensesiotNews,
  updateSensesiotNews,
  removeSensesiotNews,
});
