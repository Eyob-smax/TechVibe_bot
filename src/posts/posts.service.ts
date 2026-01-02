import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { IPost } from '../bot/utils/types.js';

@Injectable()
export class PostsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async fetchPosts(topic: string, max: number) {
    try {
      return await this.databaseService.post.findMany({
        take: max,
        orderBy: { date: 'desc' },
        include: { PostTag: { include: { Tag: true } } },
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw err;
    }
  }

  async saveNewPosts(post: IPost) {
    try {
      const tagRecords = await Promise.all(
        post.tags.map(async (tagText) => {
          let tag = await this.databaseService.tag.findUnique({
            where: { tag: tagText },
          });
          if (!tag) {
            tag = await this.databaseService.tag.create({
              data: { tag: tagText },
            });
          }
          return tag;
        }),
      );

      const newPost = await this.databaseService.post.create({
        data: {
          post: post.post,
          post_link: post.post_link,
          date_string: post.date_string,
          date: post.date,
          PostTag: {
            create: tagRecords.map((tag) => ({
              Tag: { connect: { id: tag.id } },
            })),
          },
          updatedAt: new Date(),
        },
        include: { PostTag: { include: { Tag: true } } },
      });
      return {
        message: `New post saved to the database: <a href="${post.post_link}"><b>Go to the message</b></a>`,
      };
    } catch (err) {
      console.error('Error saving post:', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteAll() {
    try {
      const deleteResult = await this.databaseService.post.deleteMany({});

      await this.databaseService.tag.deleteMany({
        where: {
          PostTag: { none: {} },
        },
      });

      return {
        deletedCount: deleteResult.count,
        message: 'All posts deleted successfully!',
      };
    } catch (err) {
      console.error('Error deleting all posts:', err);
      throw err;
    }
  }
}
