/* eslint-disable no-alert */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ReactElement, useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const formatPost = (post: any): Post => {
  return {
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      author: post.data.author,
      subtitle: post.data.subtitle,
      title: post.data.title,
    },
  };
};

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState({ next_page: null, results: [] });

  const handleLoadMore = async (): Promise<void> => {
    try {
      const response = await fetch(posts.next_page);
      const data = await response.json();

      const morePosts = data.results.map(formatPost);

      setPosts(oldState => ({
        results: [...oldState.results, ...morePosts],
        next_page: data.next_page,
      }));
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (postsPagination) {
      setPosts({
        ...postsPagination,
        results: postsPagination.results.map(item => ({
          ...item,
          first_publication_date: format(
            new Date(item.first_publication_date),
            'd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
        })),
      });
    }
  }, [postsPagination]);

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        {posts.results.length === 0 && <p>Carregando...</p>}
        <ul className={styles.list}>
          {posts.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <li className={styles.post}>
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>

                <div className={styles.postInfo}>
                  <div>
                    <FiCalendar /> {post.first_publication_date}
                  </div>

                  <div>
                    <FiUser /> {post.data.author}
                  </div>
                </div>
              </li>
            </Link>
          ))}
        </ul>

        {posts.next_page && (
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const client = getPrismicClient({ previewData });

  const response = await client.getByType('post', { pageSize: 5 });

  return {
    revalidate: 60 * 60 * 24, // 24 hours
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: response.results,
      },
    },
  };
};
