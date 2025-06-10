import { storyMapper } from '../../data/api-mapper';

export default class storyDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #dbModel;

  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }
    this.#view.renderSaveButton();
  }
  async #isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }

  constructor(storyId, { view, apiModel, dbModel}) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);
      if (!response.ok) {
        console.error('showStoryDetailAndMap: response:', response);
        this.#view.populateStoryDetailError(response.story);
        return;
      }
      const story = await storyMapper(response.story);
      console.log(story); // for debugging purpose, remove after checking it
      this.#view.populateStoryDetailAndInitialMap(response.story, story);
    } catch (error) {
      console.error('showStoryDetail: error:', error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  async postNewComment({ body }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#apiModel.storeNewCommentBystoryId(this.#storyId, { body });

      if (!response.ok) {
        console.error('postNewComment: response:', response);
        this.#view.postNewCommentFailed(response.message);
        return;
      }

      // No need to wait response
      this.notifyStoryOwner(response.data.id);

      this.#view.postNewCommentSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewComment: error:', error);
      this.#view.postNewCommentFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }

  async notifyStoryOwner(commentId) {
    try {
      const response = await this.#apiModel.sendCommentToStoryOwnerViaNotification(
        this.#storyId,
        commentId,
      );
      if (!response.ok) {
        console.error('notifyStoryOwner: response:', response);
        return;
      }
      console.log('notifyStoryOwner:', response.message);
    } catch (error) {
      console.error('notifyStoryOwner: error:', error);
    }
  }

   async notifyMe() {
    try {
      const response = await this.#apiModel.sendStoryToMeViaNotification(this.#storyId);
      if (!response.ok) {
        console.error('notifyMe: response:', response);
        return;
      }
      console.log('notifyMe:', response.message);
    } catch (error) {
      console.error('notifyMe: error:', error);
    }
  }

  async saveStory() {
    try {
      const story = await this.#apiModel.getStoryById(this.#storyId);
      await this.#dbModel.putStory(story.data);
      this.#view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveStory: error:', error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    } catch (error) {
      console.error('removeStory: error:', error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  showSaveButton() {
    if (this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }
  #isReportSaved() {
    return false;
  }
}
