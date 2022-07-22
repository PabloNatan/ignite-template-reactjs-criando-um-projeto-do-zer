/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { ReactElement } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface IPost {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: IPost;
}

export default function Post({ post }: PostProps): ReactElement {
  if (!post) {
    return <p>Carregando...</p>;
  }

  const textString = RichText.asText(post.data.content[0].body).replace(
    /\.,/g,
    ''
  );
  const numberOfWords = textString.split(' ').length;
  const timeSpent = Math.ceil(numberOfWords / 200);
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />

      <main>
        <div
          className={styles.banner}
          style={{ backgroundImage: `url(${post.data.banner.url})` }}
        />

        <article className={`${commonStyles.container} ${styles.post}`}>
          <h1>{post.data.title}</h1>

          <div className={styles.postInfo}>
            <div>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </div>

            <div>
              <FiUser /> {post.data.author} min
            </div>

            <div>
              <FiClock /> {timeSpent}
            </div>
          </div>

          <div
            dangerouslySetInnerHTML={{
              __html: RichText.asHtml(post.data.content[0].body),
            }}
            className={styles.content}
          />
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post', { pageSize: 10 });

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  previewData,
}) => {
  try {
    const prismic = getPrismicClient({ previewData });
    const response = await prismic.getByUID('post', String(params.slug));
    const post = {
      first_publication_date: format(
        new Date(response.first_publication_date),
        'd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        author: response.data.author,
        banner: {
          url: response.data.banner.url,
          alt: response.data.banner.alt,
        },
        title: response.data.title,
        content: response.data.content,
      },
    };

    if (!post) {
      return { redirect: { destination: '/', permanent: false } };
    }

    return {
      props: { post },
      revalidate: 60 * 30,
    };
  } catch {
    return { redirect: { destination: '/', permanent: false } };
  }
};
