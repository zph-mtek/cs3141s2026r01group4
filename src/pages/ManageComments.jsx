import React, { useState, useEffect } from 'react';
import { HiOutlineTrash } from "react-icons/hi2";
import { Link, useSearchParams } from 'react-router-dom';
import { getAdminComments, deleteComment } from '../API/adminActions'; 

const ManageComments = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const fetchComments = async () => {
    setIsLoading(true);
    try {

      const result = await getAdminComments(propertyId);
      console.log("res:", result);
      
      if (result.status === 'success') {
        setComments(result.data || []);
      } else {
        console.error("error fetching comments:", result.message);
      }
    } catch (error) {
      console.error("connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [propertyId]); 

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) {
      return;
    }

    try {
      const res = await deleteComment(commentId);
      if (res.status === 'success') {
        alert("Deleted comment");
        fetchComments(); 
      } else {
        alert("Failed to delete comment: " + res.message);
      }
} catch (error) {
      const errorMsg = error.response?.data?.message 
                    || error.response?.statusText 
                    || error.message;
      alert(`connection error\nproblem: ${errorMsg}\nstatus: ${error.response?.status}`);
      console.error(error);
    }
  };

  const renderStars = (rating) => {
    const starCount = parseInt(rating) || 0;
    return (
      <div className="flex gap-0.5 text-lg">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < starCount ? "text-yellow-400" : "text-gray-200"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const displayedComments = comments.filter((comment) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const authorName = `${comment.firstName || ''} ${comment.lastName || ''}`.toLowerCase();
    const content = (comment.commentText || '').toLowerCase();
    return authorName.includes(lowerSearch) || content.includes(lowerSearch);
  });

  return (
    <div className='max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-10'>
      
      <div className='flex justify-center w-full pt-10'>
        <div className='w-full md:w-[500px] relative flex gap-3'>
          <Link
            to={propertyId ? "/admin/manageproperties" : "/admin"}
            className="flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full text-gray-500 hover:text-yellow-600 hover:border-yellow-400 hover:bg-yellow-50 transition-all shadow-sm shrink-0"
            title="Go Back"
          >
            <svg className="w-6 h-6 pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <div className='w-full relative'>
            <input 
              type="text" 
              placeholder='Search comments by user or content...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-13 border-2 border-yellow-400 pl-5 pr-10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition-all text-gray-700 font-medium shadow-sm'
            /> 
            <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between border-b-2 border-gray-100 pb-3'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-gray-800'>
              {propertyId ? "Property Comments" : "All Comments"}
            </h2>
            {propertyId && comments.length > 0 && (
              <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold'>
                Filtering: {comments[0].propertyName}
              </span>
            )}
          </div>
          <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold'>
            {displayedComments.length} Total
          </span>
        </div>
        
        {isLoading ? (
           <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div></div>
        ) : displayedComments.length > 0 ? (
          displayedComments.map(comment => {
            const firstNameChar = comment.firstName ? comment.firstName[0] : '?';
            const lastNameChar = comment.lastName ? comment.lastName[0] : '';
            const initials = (firstNameChar + lastNameChar).toUpperCase();

            return (
              <div key={comment.id} className='flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-6'>

                <div className='flex items-start gap-4 lg:w-[30%] shrink-0'>
                  <div className='h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-extrabold text-lg shrink-0 mt-1'>
                    {initials}
                  </div>
                  <div className='overflow-hidden'>
                    <p className='font-bold text-gray-900 text-base leading-tight truncate'>
                      {comment.firstName || 'Unknown'} {comment.lastName || ''}
                    </p>
                    <p className='text-sm text-gray-500 mt-0.5 truncate'>{comment.authorEmail || 'No email'}</p>
                    <p className='text-xs text-gray-400 mt-1 font-medium'>Posted: {comment.postedAt}</p>
                  </div>
                </div>

                <div className='flex flex-col lg:w-1/2 w-full'>
                  <div className='flex items-center gap-3 mb-2'>
                    {renderStars(comment.rating)}
                    <span className="text-gray-300 text-sm">|</span>
                    <span className='text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded'>
                      {comment.propertyName || 'Unknown Property'}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 italic line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100'>
                    "{comment.commentText || 'No text provided'}"
                  </p>
                </div>

                <div className='flex items-center lg:w-auto w-full justify-end mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100'>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className='w-full lg:w-auto flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 font-bold py-2.5 px-6 rounded-xl transition-all duration-200 text-sm'
                  >
                    <HiOutlineTrash className="text-lg" />
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            )
          })
        ) : (
          <p className="text-center text-gray-500 py-10 font-bold">No comments found.</p>
        )}
      </div>
      
    </div>
  )
}

export default ManageComments;