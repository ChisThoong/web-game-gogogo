import { GeminiAnalysis } from "../types";

type Pool = {
  titles: string[];
  comments: string[];
};

const PANIC: Pool = {
  titles: [
    "Vừa Chạy Đã Té",
    "Chó Vừa Sủa Là Xỉu",
    "Chạy Bằng Niềm Tin",
    "Mới Rượt Đã Thua",
    "Giật Mình Chạy Bừa"
  ],
  comments: [
    "Chó mới sủa cái là chân tự khựng lại.",
    "Chưa kịp hiểu chuyện thì đã bị đuổi.",
    "Chạy kiểu hoảng loạn, chó nhìn cũng ngán.",
    "Chân chưa nóng mà tim đã lên 200.",
    "Bài học đầu đời: thấy chó là chạy."
  ]
};

const CHASE: Pool = {
  titles: [
    "Bị Rượt Sấp Mặt",
    "Chạy Vì Tính Mạng",
    "Chó Theo Sát Gót",
    "Một Pha Thoát Chết",
    "Né Chó Bằng Bản Năng"
  ],
  comments: [
    "Chó sau lưng, gió trước mặt.",
    "Chạy không đẹp nhưng rất thật.",
    "Một pha né chó hú hồn.",
    "Chó rượt mà vẫn kịp né gai, cũng giỏi.",
    "Chân run nhưng não vẫn hoạt động."
  ]
};

const SKILL: Pool = {
  titles: [
    "Thánh Né Chó",
    "Runner Bị Rượt",
    "Chạy Như Bản Năng",
    "Chó Nhìn Cũng Nản",
    "Thoát Chết Trong Gang Tấc"
  ],
  comments: [
    "Chó đuổi mệt hơn cả bạn.",
    "Né gai mượt như chưa từng sợ.",
    "Chạy tới mức chó cũng thở hổn hển.",
    "Bản năng sinh tồn đã thức tỉnh.",
    "Chó đuổi, bạn lướt."
  ]
};

const LEGEND: Pool = {
  titles: [
    "Huyền Thoại Bị Chó Rượt",
    "Chó Đuổi Không Kịp",
    "Bóng Ma Đường Phố",
    "Thần Chạy Trốn",
    "Chạy Tới Mức Chó Bỏ Cuộc"
  ],
  comments: [
    "Chó đuổi từ sáng tới chiều vẫn chưa kịp cắn.",
    "Tốc độ này chó chỉ biết đứng nhìn.",
    "Đây không phải chạy, đây là sinh tồn.",
    "Chó đã bỏ cuộc, bạn vẫn chạy.",
    "Truyền thuyết nói rằng chó còn đang tìm bạn."
  ]
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const generateRunAnalysis = (
  distance: number,
  coins: number
): GeminiAnalysis => {
  let pool: Pool;

  if (distance < 100) pool = PANIC;
  else if (distance < 500) pool = CHASE;
  else if (distance < 1000) pool = SKILL;
  else pool = LEGEND;

  return {
    title: randomFrom(pool.titles),
    comment: randomFrom(pool.comments),
  };
};
