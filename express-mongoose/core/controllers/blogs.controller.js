const Controller = require("./controller");
const BlogService = require("../services/blog-service");
const { logger } = require("../lib/log");

class BlogsController extends Controller {

  /**
   *  @api {get} /api/v1/posts returns the list of blogs that match the sort/filter criteria.
   *  @apiName posts @apiVersion 1.0.0 
   *  @apiSuccess [Posts] based on the filter criteria
   *  @apiSuccessExample Success-Response: HTTP/1.1 200 OK
   *  @apiError Internal error HTTP/1.1 500
   *
   * */
  async get_blogs(req, res, next) {
    logger.info("BlogsController -> get_blogs -> started");
    try {
      const input = req.query;
      const bs = new BlogService();
      const result = await bs.get_blogs(input);
      this.send_response(res, "success", result);
    } catch (e) {
      this.handle_error_response(error, res, next);
    }
  }

   /**
   *  @api {post} /api/v1/post that creates a new post
   *  @apiName post @apiVersion 1.0.0 
   *  @apiSuccessExample Success-Response: HTTP/1.1 200 OK
   *  @apiError Bad request HTTP/1.1 400 (Validation failed)
   *  @apiError Internal error HTTP/1.1 500
   *
   * */
  async create_blog(req, res, next) {
    logger.info("BlogsController -> create_blog -> started");
    try {
      const input = req.body;
      const bs = new BlogService();
      const result = await bs.create_blog(input);
      this.send_response(res, "success", result);
    } catch (error) {
      this.handle_error_response(error, res, next);
    }
  }

  /**
   *  @api {get} /api/v1/post/:id returns the blog that match the id.
   *  @apiName post @apiVersion 1.0.0 
   *  @apiSuccess post json 
   *  @apiSuccessExample Success-Response: HTTP/1.1 200 OK
   *  @apiError Bad request HTTP/1.1 404 (Not found)
   *  @apiError Internal error HTTP/1.1 500
   *
   * */
  async get_blog_by_id(req, res, next) {
    logger.info("BlogsController -> get_blog_by_id -> started");
    try {
      const id = req.params.id;
      const bs = new BlogService();
      const result = await bs.get_post_by_id(id);
      this.send_response(res, "success", result);
    } catch (error) {
      this.handle_error_response(error, res, next);
    }
  }

  /**
   *  @api {delete} /api/v1/post/:id delete the blog that match the id.
   *  @apiName post @apiVersion 1.0.0 
   *  @apiSuccess Success message
   *  @apiSuccessExample Success-Response: HTTP/1.1 200 OK
   *  @apiError Bad request HTTP/1.1 404 (Not found)
   *  @apiError Internal error HTTP/1.1 500
   *
   * */
  async delete_blog_by_id(req, res, next) {
    logger.info("BlogsController -> delete_blog_by_id -> started");
    try {
      const id = req.params.id;
      const bs = new BlogService();
      await bs.delete_blog_by_id(id);
      this.send_response(res, "success");
    } catch (error) {
      this.handle_error_response(error, res, next);
    }
  }

   /**
   *  @api {put} /api/v1/post/:id update the blog that match the id.
   *  @apiName post @apiVersion 1.0.0 
   *  @apiSuccess updated post json 
   *  @apiSuccessExample Success-Response: HTTP/1.1 200 OK
   *  @apiError Bad request HTTP/1.1 404 (Not found)
   *  @apiError Internal error HTTP/1.1 500
   *
   * */
  async update_blog_by_id(req, res, next) {
    logger.info("BlogsController -> update_blog_by_id -> started");
    try {
      const id = req.params.id;
      const bs = new BlogService();
      const response = await bs.update_blog_by_id(id, req.body);
      this.send_response(res, "success", response);
    } catch (error) {
      this.handle_error_response(error, res, next);
    }
  }
}

module.exports = BlogsController;
