import Giscus from '@giscus/react';

interface Props {
  slug: string;
}

export default function GiscusComments({ slug }: Props) {
  const repo = 'YOMXXX/blogs' as `${string}/${string}`;
  const repoId = 'PLACEHOLDER_REPO_ID';
  const category = 'Announcements';
  const categoryId = 'PLACEHOLDER_CATEGORY_ID';

  return (
    <div style={{ marginTop: 48 }}>
      <Giscus
        id={`giscus-${slug}`}
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark_dimmed"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
