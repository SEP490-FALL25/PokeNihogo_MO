// mock-data/reading.ts
// Dữ liệu giả lập cho danh sách bài đọc

export interface ReadingPassage {
    id: string;
    title: string;
    level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    description: string;
    content: PassageContent[];
  }
  
  export interface PassageContent {
    japanese: string;
    furigana?: string;
    vietnamese: string;
  }
  
  const READING_DATA: ReadingPassage[] = [
    {
      id: '1',
      title: 'わたしのいちにち (Một ngày của tôi)',
      level: 'N5',
      description: 'Một bài đọc đơn giản về các hoạt động hàng ngày.',
      content: [
        {
          japanese: 'わたしは　まいにち　ろくじに　おきます。',
          furigana: 'わたしは　まいにち　ろくじに　おきます。',
          vietnamese: 'Tôi thức dậy lúc 6 giờ mỗi ngày.',
        },
        {
          japanese: 'あさごはんを　たべて、がっこうへ　いきます。',
          furigana: 'あさごはんを　たべて、がっこうへ　いきます。',
          vietnamese: 'Tôi ăn sáng rồi đến trường.',
        },
        {
          japanese: 'がっこうは　くじから　さんじまでです。',
          furigana: 'がっこうは　くじから　さんじまでです。',
          vietnamese: 'Trường học từ 9 giờ đến 3 giờ.',
        },
        {
          japanese: 'よる、うちで　ばんごはんを　たべます。それから、しゅくだいを　します。',
          furigana: 'よる、うちで　ばんごはんを　たべます。それから、しゅくだいを　します。',
          vietnamese: 'Buổi tối, tôi ăn tối ở nhà. Sau đó, tôi làm bài tập về nhà.',
        },
        {
          japanese: 'じゅういちじに　ねます。',
          furigana: 'じゅういちじに　ねます。',
          vietnamese: 'Tôi đi ngủ lúc 11 giờ.',
        },
      ],
    },
    {
      id: '2',
      title: '日本の天気 (Thời tiết Nhật Bản)',
      level: 'N4',
      description: 'Tìm hiểu về các mùa và thời tiết ở Nhật Bản.',
      content: [
        {
          japanese: '日本には　しきがあります。はる、なつ、あき、ふゆです。',
          furigana: 'にほんには　しきがあります。はる、なつ、あき、ふゆです。',
          vietnamese: 'Nhật Bản có bốn mùa. Đó là mùa xuân, mùa hè, mùa thu và mùa đông.',
        },
        {
          japanese: 'はるは　あたたかいです。さくらが　きれいです。',
          furigana: 'はるは　あたたかいです。さくらが　きれいです。',
          vietnamese: 'Mùa xuân trời ấm áp. Hoa anh đào rất đẹp.',
        },
        {
          japanese: 'なつは　とても　あついです。うみへ　およぎに　いくひとが　おおいです。',
          furigana: 'なつは　とても　あついです。うみへ　およぎに　いくひとが　おおいです。',
          vietnamese: 'Mùa hè rất nóng. Nhiều người đi bơi ở biển.',
        },
        {
          japanese: 'あきは　すずしいです。やまの　もみじが　あかくなります。',
          furigana: 'あきは　すずしいです。やまの　もみじが　あかくなります。',
          vietnamese: 'Mùa thu trời mát mẻ. Lá đỏ trên núi chuyển sang màu đỏ.',
        },
        {
          japanese: 'ふゆは　さむいです。ゆきが　ふります。',
          furigana: 'ふゆは　さむいです。ゆきが　ふります。',
          vietnamese: 'Mùa đông trời lạnh. Tuyết rơi.',
        },
      ],
    },
    {
      id: '3',
      title: 'コンビニ (Cửa hàng tiện lợi)',
      level: 'N3',
      description: 'Vai trò của cửa hàng tiện lợi trong cuộc sống ở Nhật.',
      content: [
        {
          japanese: 'コンビニエンスストアは、日本人の生活に欠かせないものです。',
          furigana: 'コンビニエンスストアは、にほんじんのせいかつに　かかせないものです。',
          vietnamese: 'Cửa hàng tiện lợi (Combini) là thứ không thể thiếu trong cuộc sống của người Nhật.',
        },
        {
          japanese: 'コンビニは、２４時間営業している店が多いです。',
          furigana: 'コンビニは、２４じかんえいぎょうしているみせが　おおいです。',
          vietnamese: 'Nhiều cửa hàng tiện lợi mở cửa 24 giờ.',
        },
        {
          japanese: '食べ物や飲み物だけでなく、本や雑誌、生活用品も売っています。',
          furigana: 'たべものやのみものだけでなく、ほんやざっし、せいかつようひんも　うっています。',
          vietnamese: 'Họ không chỉ bán đồ ăn thức uống mà còn bán cả sách, tạp chí và nhu yếu phẩm hàng ngày.',
        },
        {
          japanese: 'また、公共料金の支払いや、宅配便の発送もできます。',
          furigana: 'また、こうきょうりょうきんのしはらいや、たくはいびんの　はっそうもできます。',
          vietnamese: 'Ngoài ra, bạn cũng có thể thanh toán các hóa đơn tiện ích công cộng và gửi bưu kiện.',
        },
      ],
    },
  ];
  
  export const getReadingList = () => {
    // Trong ứng dụng thực tế, đây sẽ là một lệnh gọi API
    return READING_DATA.map((item) => ({
      id: item.id,
      title: item.title,
      level: item.level,
      description: item.description,
    }));
  };
  
  export const getPassageById = (id: string): ReadingPassage | undefined => {
    // Trong ứng dụng thực tế, đây sẽ là một lệnh gọi API
    return READING_DATA.find((item) => item.id === id);
  };
  