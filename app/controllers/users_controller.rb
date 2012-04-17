class UsersController < ApplicationController
  before_filter :require_admin, :only => :create
  before_filter :load_user, :only => [:show, :update]

  def index
    present User.order("LOWER(#{params[:order]})").paginate(params.slice(:page, :per_page))
  end

  def show
    present @user
  end

  def create
    if current_user.admin?
      present User.create!(params[:user]), :status => :created
    else
      render :status => :unauthorized, :json => "Only admins can do that"
    end
  rescue ActiveRecord::RecordInvalid => e
    present_errors e.record.errors, :status => :unprocessable_entity
  end

  def update
    if current_user.admin?
      @user.admin = params[:user][:admin]
    end
    @user.save!
    present @user
  end

  private

  def load_user
    @user = User.find_by_id(params[:id])
    head(:not_found) unless @user
  end
end
