const categoryLabels = {
  review: "レビュー",
  howto: "使い方",
  compare: "比較",
  trouble: "トラブル解決",
  recommend: "おすすめ",
};

const badgeClasses = {
  review: "badge-review",
  howto: "badge-howto",
  compare: "badge-compare",
  trouble: "badge-trouble",
  recommend: "badge-recommend",
};

export function ArticleBadge({ category }) {
  return (
    <span className={`category-badge ${badgeClasses[category] || "badge-neutral"}`}>
      {categoryLabels[category] || category || "記事"}
    </span>
  );
}

export { categoryLabels };
