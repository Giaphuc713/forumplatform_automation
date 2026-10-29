"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ListOrdered,
  UploadCloud,
  Trash2,
  Search,
  ChevronDown,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { forumService } from "@/services/forum.service";
import { toast } from "sonner";
import { tag_options } from "@//components/ui/tags";
import { getFlairStyle } from "@//components/ui/tags";
import { useRouter } from "next/navigation";
import { Post, Forum } from "@/types/forum";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";
const QuillEditor = dynamic(() => import("./QuillEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-md bg-gray-50 min-h-[200px] flex items-center justify-center text-sm text-gray-400"></div>
  ),
});

interface CreatePostFormProps {
  forumId?: number;
  postId?: number;
  onForumChange?: (forumId: number | null) => void;
}

export function CreatePostForm({
  forumId,
  postId,
  onForumChange,
}: CreatePostFormProps) {
  const router = useRouter();
  const isEditMode = postId ? true : false;
  const currentStudentId = Number(Cookies.get("current_user"));
  const [activeTab, setActiveTab] = useState<"text" | "media" | "link">("text");

  // Form States
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFlairModalOpen, setIsTagModalOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Community selector state (placeholder for future)
  const [selectedForumId, setSelectedForumId] = useState<number | null>(
    forumId ?? null,
  );
  const [selectedForumName, setSelectedForumName] = useState<string | null>(
    null,
  );
  const [selectedForumAvatarUrl, setSelectedForumAvatarUrl] = useState<
    string | null
  >(null);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const communityDropdownRef = useRef<HTMLDivElement>(null);

  // Loading state for edit mode
  const [loadingPost, setLoadingPost] = useState(false);
  const [editPost, setEditPost] = useState<Post | null>(null);

  // Joined forums for community dropdown
  const [joinedForums, setJoinedForums] = useState<Forum[]>([]);
  const [communitySearchQuery, setCommunitySearchQuery] = useState("");

  const filteredTags = tag_options.filter((tag) =>
    tag.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Fetch post data for edit mode
  useEffect(() => {
    if (postId) {
      setLoadingPost(true);
      forumService
        .getPostById(postId, currentStudentId)
        .then((post) => {
          setEditPost(post);
          setTitle(post.title || "");
          setContent(post.content || "");
          setTags(post.tags || "");
          setSelectedForumId(post.forumId);
          setSelectedForumName(post.forumName);
          setSelectedForumAvatarUrl(post.forumAvatarUrl ?? null);
          if (post.imageUrl) {
            setPreviewUrl(post.imageUrl);
          }
        })
        .catch((err) => {
          console.error("Error fetching post for editing:", err);
          toast.error("Failed to load post data.");
        })
        .finally(() => setLoadingPost(false));
    }
  }, [postId]);

  // Resolve forum name from forumId (for create mode)
  useEffect(() => {
    if (forumId) {
      forumService
        .getForumById(forumId, currentStudentId)
        .then((forum) => {
          if (forum) {
            setSelectedForumName(forum.name);
            setSelectedForumAvatarUrl(forum.avatarUrl ?? null);
          }
        })
        .catch(() => { });
    }
  }, [forumId]);

  // Fetch joined forums for community dropdown
  useEffect(() => {
    forumService
      .getJoinedForums(currentStudentId)
      .then((forums) => {
        setJoinedForums(forums);
      })
      .catch((err) => {
        console.error("Error fetching joined forums:", err);
      })
  }, []);

  // Close community dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        communityDropdownRef.current &&
        !communityDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCommunityDropdownOpen(false);
      }
    }
    if (isCommunityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCommunityDropdownOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append(
        "forumId",
        editPost ? String(editPost.forumId) : String(selectedForumId),
      );
      formData.append("studentId", editPost ? String(editPost.authorId) : String(currentStudentId));
      formData.append("title", title);
      formData.append("tags", tags);

      // Append content (if it's a link tab, prepend the link)
      const finalContent =
        activeTab === "link" && linkUrl.trim()
          ? `<p><a href="${linkUrl}">${linkUrl}</a></p>${content}`
          : content;
      formData.append("content", finalContent);

      // Append File if uploaded
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      if (isEditMode && editPost) {
        await forumService.updatePost(editPost.id, formData, editPost.authorId);
        toast.success("Post updated successfully!");
      } else {
        // Creating new post
        await forumService.createPost(formData);
        toast.success("Post created successfully!");
        window.dispatchEvent(new Event("post-created"));
      }

      router.back();
    } catch (error: any) {
      console.error("Error submitting post:", error);
      toast.error(
        isEditMode
          ? "Failed to update post. Please try again."
          : "Failed to create post. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit post" : "Create post"}
            </h2>
          </div>
        </div>

        <div className="p-6">
          {/* Community Selector */}
          <div className="relative mb-4" ref={communityDropdownRef}>
            <button
              type="button"
              onClick={() => {
                if (!isEditMode) {
                  setIsCommunityDropdownOpen(!isCommunityDropdownOpen);
                }
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isEditMode
                ? "bg-gray-100 cursor-default"
                : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                }`}
            >
              {selectedForumAvatarUrl ? (
                <img
                  src={selectedForumAvatarUrl}
                  alt={selectedForumName || "Forum"}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {selectedForumName
                    ? selectedForumName.charAt(0).toUpperCase()
                    : "?"}
                </div>
              )}
              <span className="text-sm font-semibold text-gray-900">
                {selectedForumName || "Select a community"}
              </span>
              {!isEditMode && <ChevronDown className="w-4 h-4 text-gray-600" />}
            </button>

            {/* Dropdown — shows joined forums */}
            {isCommunityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                {/* Search inside dropdown */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search communities"
                      value={communitySearchQuery}
                      onChange={(e) => setCommunitySearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg text-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="px-3 pt-1 pb-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Your communities
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {joinedForums
                    .filter((f) =>
                      f.name.toLowerCase().includes(communitySearchQuery.toLowerCase())
                    )
                    .map((forum) => (
                      <button
                        key={forum.id}
                        type="button"
                        onClick={() => {
                          setSelectedForumId(forum.id);
                          setSelectedForumName(forum.name);
                          setSelectedForumAvatarUrl(forum.avatarUrl ?? null);
                          setIsCommunityDropdownOpen(false);
                          setCommunitySearchQuery("");
                          onForumChange?.(forum.id);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${selectedForumId === forum.id ? "bg-blue-50" : ""
                          }`}
                      >
                        {forum.avatarUrl ? (
                          <img
                            src={forum.avatarUrl}
                            alt={forum.name}
                            className="w-7 h-7 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-[11px] text-white font-bold">
                            {forum.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-gray-900 leading-tight">
                            {forum.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {forum.membersCount} members
                          </span>
                        </div>
                        {selectedForumId === forum.id && (
                          <span className="ml-auto text-blue-600 text-xs font-bold">✓</span>
                        )}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <TabButton
              active={activeTab === "text"}
              onClick={() => setActiveTab("text")}
              icon={<FileText className="w-5 h-5" />}
              label="Text"
            />
            <TabButton
              active={activeTab === "media"}
              onClick={() => setActiveTab("media")}
              icon={<ImageIcon className="w-5 h-5" />}
              label="Images & Video"
            />
            <TabButton
              active={activeTab === "link"}
              onClick={() => setActiveTab("link")}
              icon={<LinkIcon className="w-5 h-5" />}
              label="Link"
            />
            <TabButton
              active={false}
              onClick={() => { }}
              icon={<ListOrdered className="w-5 h-5 text-gray-300" />}
              label="Poll"
              disabled
            />
          </div>

          {/* Title Input */}
          <div className="relative mb-3">
            <input
              type="text"
              value={title}
              placeholder="Title*"
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              className="w-full border border-gray-200 rounded-md py-2.5 px-4 text-sm font-medium focus:outline-none focus:outline-black focus:border-black placeholder:font-normal"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              {title.length}/300
            </span>
          </div>

          {/* Tags / Flair button */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setIsTagModalOpen(true)}
              className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm font-semibold transition-colors border ${tags !== "No tag" && tags !== ""
                ? getFlairStyle(tags)
                : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
                }`}
            >
              {tags !== "No tag" && tags !== "" ? tags : "Add tags*"}
            </button>
          </div>

          {/* Dynamic Section Based on Tab */}
          {activeTab === "media" && (
            <div className="mb-4">
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl h-30 flex flex-col items-center justify-center gap-2 text-gray-500 font-medium cursor-pointer hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-all group"
                >
                  <div className="p-4 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-colors mb-2">
                    <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <span>Drag and Drop or upload media</span>
                </div>
              ) : (
                <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow-sm group bg-gray-900 flex items-center justify-center">
                  {selectedFile?.type.startsWith("video/") ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Media preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      type="button"
                      className="p-2.5 bg-gray-500/90 hover:bg-gray-600 text-white rounded-full shadow-lg backdrop-blur-sm transition-transform transform hover:scale-110"
                      title="Remove media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* The hidden input */}
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
            </div>
          )}

          {activeTab === "link" && (
            <input
              type="url"
              placeholder="Link URL *"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-md py-2 px-4 text-sm mb-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          )}

          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="Body text*"
          />

          {/* Optional image upload for text tab */}
          {activeTab === "text" && (
            <div className="mt-4">
              <div className="relative w-full h-30 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center group transition-colors hover:bg-gray-100">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                )}
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 z-10 transition-opacity" />
                )}
                <div className="relative z-20 flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg border border-blue-600/20 rounded-full transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                    type="button"
                  >
                    <ImageIcon className="w-4 h-4 " />
                    {previewUrl ? "Change Image" : "Add Image"}
                  </button>

                  {previewUrl && (
                    <button
                      onClick={handleRemoveFile}
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-500 hover:bg-gray-600 shadow-md hover:shadow-lg rounded-full transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl mt-auto">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-full font-bold text-sm text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="px-6 py-2 rounded-full font-bold text-sm text-white bg-[#0045B8] hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? "Posting..." : isEditMode ? "Save" : "Post"}
          </button>
        </div>
      </div>

      {/* Flair / Tag Selection Modal */}
      {isFlairModalOpen && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsTagModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-5 font-sans animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add tags</h3>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full text-sm font-medium outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-3 cursor-pointer group py-1"
                >
                  <input
                    type="radio"
                    name="tag"
                    value={tag.label}
                    checked={tags === tag.label}
                    onChange={(e) => {
                      setTags(e.target.value);
                    }}
                    className="w-4 h-4 border-gray-300 cursor-pointer"
                  />
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tag.bg} ${tag.text}`}
                  >
                    {tag.label}
                  </span>
                </label>
              ))}
            </div>

            {!showAllTags && filteredTags.length > 4 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAllTags(true)}
                  className="text-sm font-bold text-gray-900 hover:underline"
                >
                  View all Tags
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper components
function TabButton({ active, onClick, icon, label, disabled = false }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 py-3 px-6 text-sm font-bold border-b-2 transition-colors ${active
        ? "border-[#0045B8] text-[#0045B8]"
        : "border-transparent text-gray-500 hover:bg-gray-50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}
