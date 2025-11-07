import {
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(@Query('topic') topic: string, @Query('max') max: number) {
    return await this.postsService.fetchPosts(topic, max);
  }
  @Delete()
  async delteAllPosts() {
    await this.postsService.deleteAll();
  }
}
