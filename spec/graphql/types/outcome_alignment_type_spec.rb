# frozen_string_literal: true

#
# Copyright (C) 2022 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

require_relative "../../spec_helper"
require_relative "../graphql_spec_helper"

describe Types::OutcomeAlignmentType do
  before :once do
    account_admin_user
    course_model
    outcome_with_rubric
    @quiz_item = assignment_quiz([], course: @course, title: "BBB Quiz")
    @quiz = @assignment
    @assignment = @course.assignments.create!(title: "AAA Assignment")
    @discussion = @course.assignments.create!(title: "CCC Discussion")
    @discussion_item = @course.discussion_topics.create!(
      user: @teacher,
      title: "discussion item",
      assignment: @discussion
    )
    @module = @course.context_modules.create!(name: "module")
    @course.account.enable_feature!(:outcome_alignment_summary)
  end

  let(:graphql_context) { { current_user: @admin } }
  let(:outcome_type) { GraphQLTypeTester.new(@outcome, graphql_context) }

  def resolve_field(field_name)
    outcome_type.resolve("alignments(contextType: \"Course\", contextId: #{@course.id}) { #{field_name} }")[0]
  end

  describe "for each outcome alignment" do
    before do
      @module.add_item type: "assignment", id: @assignment.id
      @rubric.associate_with(@assignment, @course, purpose: "grading")
      @outcome_alignment = ContentTag.last
    end

    it "returns _id" do
      expect(resolve_field("_id")).to eq @outcome_alignment.id.to_s
    end

    it "returns learning_outcome_id" do
      expect(resolve_field("learningOutcomeId")).to eq @outcome.id.to_s
    end

    it "returns context_id" do
      expect(resolve_field("contextId")).to eq @course.id.to_s
    end

    it "returns context_type" do
      expect(resolve_field("contextType")).to eq "Course"
    end

    it "returns content_id" do
      expect(resolve_field("contentId")).to eq @outcome_alignment.content_id.to_s
    end

    it "returns content_type" do
      expect(resolve_field("contentType")).to eq "Assignment"
    end

    it "returns title" do
      expect(resolve_field("title")).to eq @assignment.title
    end

    it "returns url" do
      expect(resolve_field("url")).to eq "/courses/#{@course.id}/outcomes/#{@outcome.id}/alignments/#{@outcome_alignment.id}"
    end

    it "returns module_id" do
      expect(resolve_field("moduleId")).to eq @module.id.to_s
    end

    it "returns module_name" do
      expect(resolve_field("moduleName")).to eq @module.name
    end

    it "returns module_url" do
      expect(resolve_field("moduleUrl")).to eq "/courses/#{@course.id}/modules/#{@module.id}"
    end

    it "returns module_workflow_state" do
      expect(resolve_field("moduleWorkflowState")).to eq @module.workflow_state
    end
  end

  describe "for outcome alignment to an Assignment" do
    before do
      @rubric.associate_with(@assignment, @course, purpose: "grading")
    end

    it "returns assignment_content_type 'assignment'" do
      expect(resolve_field("assignmentContentType")).to eq "assignment"
    end
  end

  describe "for outcome alignment to a Quiz" do
    before do
      @rubric.associate_with(@quiz, @course, purpose: "grading")
    end

    it "returns assignment_content_type 'quiz'" do
      expect(resolve_field("assignmentContentType")).to eq "quiz"
    end
  end

  describe "for outcome alignment to a Discussion" do
    before do
      @rubric.associate_with(@discussion, @course, purpose: "grading")
    end

    it "returns assignment_content_type 'discussion'" do
      expect(resolve_field("assignmentContentType")).to eq "discussion"
    end
  end

  describe "for outcome alignment to a Rubric" do
    it "returns null assignment_content_type" do
      expect(resolve_field("assignmentContentType")).to be_nil
    end
  end
end
