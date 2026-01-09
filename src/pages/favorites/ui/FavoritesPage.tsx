import { CardList } from '@/widgets/card-list';

export const FavoritesPage = () => {
  // 임시 데이터 - 나중에 API나 상태 관리로 대체 가능
  const favoriteCards = [
    {
      id: 1,
      title: '즐겨찾기 항목 1',
      description: '이것은 첫 번째 즐겨찾기 항목의 설명입니다. 클릭하면 메인화면으로 이동합니다.',
      href: '/',
    },
    {
      id: 2,
      title: '즐겨찾기 항목 2',
      description: '이것은 두 번째 즐겨찾기 항목의 설명입니다. 더 자세한 내용을 여기에 표시할 수 있습니다.',
      href: '/',
    },
    {
      id: 3,
      title: '즐겨찾기 항목 3',
      description: '세 번째 즐겨찾기 항목입니다. 다양한 정보를 카드 형태로 표시할 수 있습니다.',
      href: '/',
    },
    {
      id: 4,
      title: '즐겨찾기 항목 4',
      description: '네 번째 즐겨찾기 항목입니다. 카드 리스트는 반응형 그리드로 표시됩니다.',
      href: '/',
    },
    {
      id: 5,
      title: '즐겨찾기 항목 5',
      description: '다섯 번째 즐겨찾기 항목입니다. 모바일에서는 1열, 태블릿에서는 2열, 데스크톱에서는 3열로 표시됩니다.',
      href: '/',
    },
    {
      id: 6,
      title: '즐겨찾기 항목 6',
      description: '여섯 번째 즐겨찾기 항목입니다. 6개 이상의 카드도 목록으로 잘 표시됩니다.',
      href: '/',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-[15px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            즐겨찾기
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            즐겨찾기한 항목들을 확인하세요
          </p>
        </div>
        
        {favoriteCards.length > 0 ? (
          <CardList cards={favoriteCards} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              즐겨찾기한 항목이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
