var express = require("express");
var router = express.Router();
const BlogsController = require("../core/controllers/blogs.controller");

const API_GROUP = "/api/v1";

router.get(API_GROUP + "/posts", (...args) =>
    new BlogsController().get_blogs(...args)
);

router.post(API_GROUP + "/post", (...args) =>
    new BlogsController().create_blog(...args)
);
router.delete(API_GROUP + "/post/:id", (...args) =>
    new BlogsController().delete_blog_by_id(...args)
);
router.get(API_GROUP + "/post/:id", (...args) =>
    new BlogsController().get_blog_by_id(...args)
);

router.put(API_GROUP + "/post/:id", (...args) =>
    new BlogsController().update_blog_by_id(...args)
);

module.exports = router;
