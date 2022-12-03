import { Router, urlencoded } from "express";
import multer from "multer";
import Jimp from "jimp";
import objectHash from "object-hash";

import { error } from "../../utils/logging.js";
import WebError from "../../utils/weberror.js";
import {
  createSensesiotNews,
  getSensesiotNews,
  getSensesiotNewsById,
  removeSensesiotNews,
  updateSensesiotNews,
} from "../../services/news.js";
import { getUserInfo } from "../../services/user.js";
import {
  pathJoinBucket,
  sensesiotBucket,
} from "../../database/firebase-storage.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/news", async (req, res) => {
  try {
    let limit;
    if (req.query.limit) {
      const limitQuery = parseInt(req.query.limit, 10);
      if (Number.isInteger(limitQuery) && limitQuery > 0) {
        limit = limitQuery;
      }
    }

    let onlyPublish = false;
    if (req.query.onlyPublish !== undefined) {
      onlyPublish = true;
    }
    const newsDocs = await getSensesiotNews({ limit, onlyPublish });

    res.status(200).json({
      status: "OK",
      news: newsDocs,
    });
  } catch (err) {
    let code = 500;

    if (err instanceof WebError) {
      code = err.code;
    }

    error(err.message, { name: "Web", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

router.get("/news/:id", async (req, res) => {
  try {
    const newsDoc = await getSensesiotNewsById(req.params.id);

    res.status(200).json({
      status: "OK",
      news: newsDoc,
    });
  } catch (err) {
    let code = 500;

    if (err instanceof WebError) {
      code = err.code;
    }

    error(err.message, { name: "Web", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

router.post("/news/add", upload.single("imageFile"), async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (userInfo.role !== "developer") {
      throw new WebError("Forbidden", 403);
    }

    if (!req.body) {
      throw new WebError("Missing Parameter(s)", 400);
    }

    let filename = "";

    if (req.file) {
      const imgBuffer = await Jimp.read(req.file.buffer).then((img) =>
        img.resize(1024, 400).getBufferAsync("image/png")
      );
      filename = `news-${objectHash({
        ts: Date.now(),
        rng: Math.random(),
      })}.png`;

      // async upload to storage
      await sensesiotBucket()
        .file(pathJoinBucket("newsImages", filename))
        .save(imgBuffer)
        .then(() =>
          sensesiotBucket()
            .file(pathJoinBucket("newsImages", filename))
            .makePublic()
        )
        .catch((err) => {
          error(err.message, { name: "Firebase Storage" });
        });
    } else {
      throw new WebError("Required Image", 400);
    }

    const news = await createSensesiotNews({
      name: req.body.name,
      description: req.body.description,
      link: req.body.link,
      published: req.body.published === "true",
      imgSrc: filename,
    });

    res.status(200).json({
      status: "OK",
      news,
    });
  } catch (err) {
    let code = 500;

    if (err instanceof WebError) {
      code = err.code;
    }

    error(err.message, { name: "Web", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

router.post(
  "/news/edit/:id",
  urlencoded({ extended: true }),
  upload.single("replacedFile"),
  async (req, res) => {
    try {
      if (!req.session) {
        throw new WebError("No Session", 500);
      }
      if (!req.session.userData) {
        throw new WebError("Forbidden", 403);
      }

      const userInfo = await getUserInfo(req.session.userData.uid);
      if (userInfo.role !== "developer") {
        throw new WebError("Forbidden", 403);
      }

      if (!req.body) {
        throw new WebError("Missing Parameter(s)", 400);
      }

      const oldNewsDoc = await getSensesiotNewsById(req.params.id);

      let filename = "";
      if (req.file) {
        const imgBuffer = await Jimp.read(req.file.buffer).then((img) =>
          img.resize(1024, 400).getBufferAsync("image/png")
        );
        filename = `news-${objectHash({
          ts: Date.now(),
          rng: Math.random(),
        })}.png`;

        await Promise.all([
          sensesiotBucket()
            .file(pathJoinBucket("newsImages", oldNewsDoc.imgSrc))
            .delete()
            .catch((err) => {
              error(err.message, { name: "Firebase Storage" });
            }),
          sensesiotBucket()
            .file(pathJoinBucket("newsImages", filename))
            .save(imgBuffer)
            .then(() =>
              sensesiotBucket()
                .file(pathJoinBucket("newsImages", filename))
                .makePublic()
            )
            .catch((err) => {
              error(err.message, { name: "Firebase Storage" });
            }),
        ]);
      }

      const news = await updateSensesiotNews(req.params.id, {
        name: req.body.name !== undefined ? req.body.name : oldNewsDoc.name,
        description:
          req.body.description !== undefined
            ? req.body.description
            : oldNewsDoc.description,
        link: req.body.link !== undefined ? req.body.link : oldNewsDoc.link,
        published:
          req.body.published !== undefined
            ? req.body.published === "true"
            : oldNewsDoc.published,
        imgSrc: filename || oldNewsDoc.imgSrc,
      });

      res.status(200).json({
        status: "OK",
        news,
      });
    } catch (err) {
      let code = 500;

      if (err instanceof WebError) {
        code = err.code;
      }

      error(err.message, { name: "Web", tags: [`${code}`] });
      res.status(code).json({
        status: "Error",
        code,
        message: err.message,
      });
    }
  }
);

router.post("/news/delete/:id", async (req, res) => {
  try {
    if (!req.session) {
      throw new WebError("No Session", 500);
    }
    if (!req.session.userData) {
      throw new WebError("Forbidden", 403);
    }

    const userInfo = await getUserInfo(req.session.userData.uid);
    if (userInfo.role !== "developer") {
      throw new WebError("Forbidden", 403);
    }

    const { imgSrc } = await getSensesiotNewsById(req.params.id);

    await removeSensesiotNews(req.params.id);

    // async upload to storage
    sensesiotBucket()
      .file(pathJoinBucket("newsImages", imgSrc))
      .delete()
      .catch((err) => {
        error(err.message, { name: "Firebase Storage" });
      });

    res.status(200).json({
      status: "OK",
    });
  } catch (err) {
    let code = 500;

    if (err instanceof WebError) {
      code = err.code;
    }

    error(err.message, { name: "Web", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      message: err.message,
    });
  }
});

export default router;
