import React from 'react'

function ArticleBanner({ src }) {
    return (
        <div className="article-banner">
            <img src={src} alt="Article Banner" />
        </div>
    )
}

export default ArticleBanner