const PostModel = require("../schemas/blogsSchema");
const Controller = require("../controllers/controller");

class BlogService {

    async get_blogs(input) {

        const { category } = input;

        let sort_filter = { date: -1, name: 1 };

        let fiter = {};

        if (category) {
            fiter.category = category
        }

        const posts = await PostModel.find(fiter, {
            _id: 0,
            __v: 0,
        }).sort(sort_filter);

        return posts;
    }


    async create_blog(input) {

        let post = new PostModel(input);

        let error = post.validateSync();

        if (error) {
            let e = Controller.get_error("badRequest", error.message);
            throw e;
        }

        let result = await PostModel.create(post);
        return result;
    }

    async delete_blog_by_id(id) {

        let post = null;

        try {
            post = await PostModel.findByIdAndDelete(id, {
                _id: 0,
                __v: 0,
            });
        } catch (error) {
            let e = Controller.get_error("notFound", `Post not found for id ${id}`);
            throw e;
        }
        return post;
    }

    async get_post_by_id(id) {

        let post = null;

        try {
            post = await PostModel.findById(id, {
                _id: 0,
                __v: 0,
            });
        } catch (error) {
            console.log(error);
            let e = Controller.get_error("notFound", `Post not found for id ${id}`);
            throw e;
        }

        return post;
    }

    async update_blog_by_id(id, input) {
        let post = null;

        const { name, content, category } = input;

        try {
            post = await PostModel.findById(id, {
                _id: 0,
                __v: 0,
            });
        } catch (error) {
            console.log(error);
            let e = Controller.get_error("notFound", `Post not found for id ${id}`);
            throw e;
        }

        if (name) {
            post.name = name;
        }

        if (content) {
            post.content = content;
        }

        if (category) {
            post.category = category;
        }

        post.date = new Date();

        let error = post.validateSync();

        if (error) {
            let e = Controller.get_error("badRequest", error.message);
            throw e;
        }

        await PostModel.updateOne(
            { _id: id },
            { $set: post }
        );

        return post
    }

}
module.exports = BlogService;
