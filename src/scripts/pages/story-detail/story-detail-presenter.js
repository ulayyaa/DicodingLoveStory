import { storyMapper } from '../../data/api-mapper';

export default class storyDetailPresenter {
  #storyId;
  #view;
  #apiModel;

  constructor(storyId, { view, apiModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
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
      const response = await this.#apiModel.getstoryById(this.#storyId);

      if (!response.ok) {
        console.error('showStoryDetailAndMap: response:', response);
        this.#view.populateStoryDetailError(response.message);
        return;
      }
      const story = await storyMapper(response.data);
      console.log(story); // for debugging purpose, remove after checking it
      this.#view.populateStoryDetailAndInitialMap(response.message, story);
    } catch (error) {
      console.error('showStoryDetail: error:', error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  async getCommentsList() {
    this.#view.showCommentsLoading();
    try {
      const response = await this.#apiModel.getAllCommentsBystoryId(this.#storyId);
      this.#view.populatestoryDetailComments(response.message, response.data);
    } catch (error) {
      console.error('getCommentsList: error:', error);
      this.#view.populateCommentsListError(error.message);
    } finally {
      this.#view.hideCommentsLoading();
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

  showSaveButton() {
    if (this.#isstoriesaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  #isstoriesaved() {
    return false;
  }
}
