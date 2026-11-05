import type { AppData, Era, KnowledgeItem, QuizItem } from '../types';
import { DEFAULT_SITE } from './site';
import bank from './sosialEkonomiBank.json';

const q = (id: string, era: Era, question: string, answerMS: string, alternatives: string[], keywords: string[], answerZH = ''): KnowledgeItem =>
  ({ id, era, question, answerMS, alternatives, keywords, answerZH, enabled: true });

export const importedQuestions:KnowledgeItem[]=bank as KnowledgeItem[];
export const seedQuestions: KnowledgeItem[] = [
  q('P001','Paleolitik','Di manakah manusia Zaman Paleolitik tinggal?','Manusia Zaman Paleolitik tinggal di gua dan kawasan terbuka.',['Manusia Paleolitik tinggal di mana?','Apakah tempat tinggal manusia Paleolitik?','Di mana orang Paleolitik berlindung?'],['paleolitik','tempat tinggal','gua','berlindung'],'旧石器时代的人类居住在洞穴和露天地区。'),
  q('P002','Paleolitik','Apakah makanan manusia Zaman Paleolitik?','Mereka mendapatkan makanan dengan memburu haiwan dan mengumpulkan hasil hutan.',['Apa yang dimakan oleh manusia Paleolitik?','Bagaimana manusia Paleolitik mendapat makanan?'],['paleolitik','makanan','memburu','buah']),
  q('P003','Paleolitik','Bagaimanakah cara hidup manusia Zaman Paleolitik?','Mereka hidup secara nomad, iaitu berpindah-randah dari satu tempat ke tempat yang lain.',['Adakah manusia Paleolitik berpindah-randah?','Apakah maksud hidup nomad pada Zaman Paleolitik?'],['paleolitik','nomad','cara hidup','berpindah']),
  q('P004','Paleolitik','Apakah peralatan yang digunakan pada Zaman Paleolitik?','Mereka menggunakan peralatan batu yang kasar dan ringkas.',['Bagaimanakah alat batu Zaman Paleolitik?','Apakah ciri peralatan Paleolitik?'],['paleolitik','peralatan','batu','kasar']),
  q('P005','Paleolitik','Apakah kegiatan utama manusia Zaman Paleolitik?','Kegiatan utama mereka ialah memburu haiwan dan mengumpulkan makanan.',['Apakah aktiviti harian orang Paleolitik?','Bagaimanakah manusia Paleolitik mencari makanan?'],['paleolitik','kegiatan','memburu','mengumpul']),
  q('P006','Paleolitik','Mengapakah manusia Zaman Paleolitik berpindah-randah?','Mereka berpindah untuk mencari makanan, air dan tempat perlindungan yang sesuai.',['Kenapa manusia Paleolitik hidup nomad?','Mengapa manusia Paleolitik tidak menetap?'],['paleolitik','berpindah','sebab','makanan']),
  q('P007','Paleolitik','Adakah manusia Zaman Paleolitik bercucuk tanam?','Tidak. Mereka belum menjalankan pertanian secara tetap; mereka bergantung pada sumber alam.',['Sudahkah orang Paleolitik bertani?','Apakah kegiatan pertanian Paleolitik?'],['paleolitik','bertani','pertanian','tanam']),
  q('P008','Paleolitik','Bagaimanakah manusia Zaman Paleolitik menggunakan batu?','Mereka membentuk batu secara ringkas untuk membuat alat memotong dan memburu.',['Apakah kegunaan batu pada Zaman Paleolitik?','Bagaimana alat batu Paleolitik digunakan?'],['paleolitik','batu','alat','memotong']),
  q('P009','Paleolitik','Apakah fungsi gua pada Zaman Paleolitik?','Gua menjadi tempat berlindung daripada hujan, panas dan bahaya haiwan liar.',['Mengapakah orang Paleolitik tinggal di gua?','Untuk apa gua digunakan pada Zaman Paleolitik?'],['paleolitik','gua','perlindungan','bahaya']),
  q('P010','Paleolitik','Namakan satu tapak prasejarah di Malaysia yang mempunyai bukti Zaman Paleolitik.','Bukit Jawa di Lenggong, Perak ialah salah satu tapak yang mempunyai bukti kegiatan manusia Zaman Paleolitik.',['Di manakah tapak Paleolitik di Malaysia?','Apakah contoh lokasi Paleolitik di Malaysia?'],['paleolitik','tapak','Malaysia','Bukit Jawa']),

  q('M001','Mesolitik','Di manakah manusia Zaman Mesolitik tinggal?','Mereka berlindung di gua, kawasan tepi sungai dan pesisir pantai yang sesuai.',['Apakah tempat tinggal orang Mesolitik?','Di mana manusia Mesolitik berlindung?'],['mesolitik','tempat tinggal','gua','pantai']),
  q('M002','Mesolitik','Apakah kegiatan utama manusia Zaman Mesolitik?','Mereka memburu, menangkap ikan dan mengumpulkan makanan daripada alam.',['Apakah aktiviti manusia Mesolitik?','Bagaimanakah mereka mendapatkan makanan pada Zaman Mesolitik?'],['mesolitik','kegiatan','ikan','memburu']),
  q('M003','Mesolitik','Bagaimanakah peralatan batu pada Zaman Mesolitik?','Peralatan batu menjadi lebih kecil dan lebih halus berbanding sebelumnya.',['Apakah ciri-ciri alat batu Mesolitik?','Adakah alat Mesolitik lebih halus?'],['mesolitik','peralatan','batu','halus']),
  q('M004','Mesolitik','Mengapakah kawasan sungai penting pada Zaman Mesolitik?','Sungai membekalkan air dan ikan serta menjadi tempat mendapatkan sumber makanan.',['Apakah kegunaan sungai untuk manusia Mesolitik?','Kenapa manusia Mesolitik tinggal dekat sungai?'],['mesolitik','sungai','air','ikan']),
  q('M005','Mesolitik','Apakah makanan manusia Zaman Mesolitik?','Makanan mereka termasuk ikan, kerang, haiwan buruan dan tumbuhan liar.',['Apa yang dimakan oleh manusia Mesolitik?','Adakah orang Mesolitik makan ikan dan kerang?'],['mesolitik','makanan','kerang','ikan']),
  q('M006','Mesolitik','Adakah manusia Zaman Mesolitik masih memburu?','Ya. Memburu masih menjadi salah satu cara mereka mendapatkan makanan.',['Adakah orang Mesolitik memburu haiwan?','Bagaimana Mesolitik mendapatkan daging?'],['mesolitik','memburu','haiwan','aktiviti']),
  q('M007','Mesolitik','Bagaimanakah cara hidup manusia Zaman Mesolitik?','Mereka masih berpindah-randah, tetapi mula tinggal sementara di kawasan yang mempunyai sumber makanan.',['Adakah manusia Mesolitik hidup nomad?','Adakah manusia Mesolitik menetap?'],['mesolitik','cara hidup','nomad','sementara']),
  q('M008','Mesolitik','Apakah sumber makanan dari laut pada Zaman Mesolitik?','Antaranya ialah ikan dan kerang-kerangan yang dikumpulkan di kawasan pesisir pantai.',['Apakah hasil laut Mesolitik?','Manusia Mesolitik menangkap apa di laut?'],['mesolitik','laut','ikan','kerang']),
  q('M009','Mesolitik','Apakah perbezaan alat Paleolitik dan Mesolitik?','Alat Paleolitik umumnya kasar, manakala alat Mesolitik lebih kecil dan lebih halus.',['Bandingkan peralatan Paleolitik dengan Mesolitik.','Apakah perubahan peralatan pada Zaman Mesolitik?'],['mesolitik','paleolitik','perbezaan','alat']),
  q('M010','Mesolitik','Apakah hubungan alam sekitar dengan kehidupan Mesolitik?','Mereka memilih tempat tinggal dan aktiviti berdasarkan air, hidupan liar dan sumber makanan yang terdapat di sekeliling.',['Bagaimanakah alam sekitar mempengaruhi orang Mesolitik?','Mengapa lokasi semula jadi penting pada Mesolitik?'],['mesolitik','alam sekitar','lokasi','sumber']),

  q('N001','Neolitik','Bagaimanakah cara hidup manusia Zaman Neolitik?','Manusia Zaman Neolitik mula hidup secara menetap dan membina petempatan.',['Adakah manusia Neolitik tinggal tetap?','Apakah perubahan cara hidup Zaman Neolitik?'],['neolitik','menetap','cara hidup','petempatan']),
  q('N002','Neolitik','Apakah pekerjaan manusia Zaman Neolitik?','Mereka bercucuk tanam, menternak haiwan dan masih menjalankan kegiatan lain seperti menangkap ikan.',['Apakah kegiatan ekonomi Neolitik?','Bagaimanakah manusia Neolitik mencari makanan?'],['neolitik','pekerjaan','bertani','ternakan']),
  q('N003','Neolitik','Bagaimanakah alat batu Zaman Neolitik?','Alat batu semakin licin dan digilap supaya lebih sesuai digunakan.',['Apakah ciri peralatan Zaman Neolitik?','Adakah batu Neolitik digilap?'],['neolitik','batu','digilap','licin']),
  q('N004','Neolitik','Apakah kegunaan tembikar pada Zaman Neolitik?','Tembikar digunakan untuk menyimpan air, makanan dan bahan keperluan.',['Mengapakah orang Neolitik membuat tembikar?','Untuk apa tembikar digunakan?'],['neolitik','tembikar','menyimpan','air']),
  q('N005','Neolitik','Mengapakah manusia Neolitik bercucuk tanam?','Pertanian membantu mereka memperoleh bekalan makanan yang lebih teratur.',['Apakah kebaikan pertanian pada Zaman Neolitik?','Mengapa Neolitik mula bertani?'],['neolitik','pertanian','sebab','bekalan']),
  q('N006','Neolitik','Apakah contoh haiwan yang diternak pada Zaman Neolitik?','Manusia Neolitik mula memelihara dan menternak haiwan untuk mendapatkan sumber makanan.',['Adakah manusia Neolitik menternak haiwan?','Apakah tujuan penternakan Neolitik?'],['neolitik','penternakan','haiwan','makanan']),
  q('N007','Neolitik','Di manakah manusia Zaman Neolitik tinggal?','Mereka tinggal di rumah atau pondok daripada bahan semula jadi dalam petempatan yang lebih tetap.',['Apakah jenis rumah manusia Neolitik?','Adakah manusia Neolitik masih tinggal di gua?'],['neolitik','tempat tinggal','rumah','pondok']),
  q('N008','Neolitik','Apakah kegunaan kayu pada Zaman Neolitik?','Kayu digunakan sebagai bahan untuk membina rumah, membuat peralatan dan membantu kegiatan harian.',['Mengapakah orang Neolitik menggunakan kayu?','Untuk apa kayu digunakan pada Neolitik?'],['neolitik','kayu','kegunaan','rumah']),
  q('N009','Neolitik','Bagaimanakah pertanian mengubah kehidupan manusia Neolitik?','Pertanian menggalakkan kehidupan menetap dan pembentukan petempatan.',['Apakah kesan pertanian pada Zaman Neolitik?','Mengapa kehidupan Neolitik menjadi menetap?'],['neolitik','pertanian','kesan','menetap']),
  q('N010','Neolitik','Apakah perubahan penting dari Mesolitik ke Neolitik?','Manusia mula hidup lebih menetap serta mengembangkan pertanian, penternakan dan penggunaan tembikar.',['Bandingkan zaman Mesolitik dan Neolitik.','Apa yang berubah pada Zaman Neolitik?'],['mesolitik','neolitik','perubahan','pertanian']),

  q('L001','Logam','Apakah bahan utama yang digunakan pada Zaman Logam?','Manusia mula menghasilkan peralatan daripada logam seperti gangsa dan besi.',['Apakah jenis logam yang digunakan?','Apakah peralatan Zaman Logam dibuat daripada apa?'],['logam','bahan','gangsa','besi']),
  q('L002','Logam','Bagaimanakah kehidupan manusia Zaman Logam?','Mereka hidup secara menetap dalam petempatan yang semakin tersusun.',['Adakah manusia Zaman Logam menetap?','Apakah ciri cara hidup Zaman Logam?'],['logam','menetap','petempatan','cara hidup']),
  q('L003','Logam','Apakah kegiatan ekonomi Zaman Logam?','Kegiatan mereka termasuk pertanian, penternakan, pertukangan dan perdagangan.',['Apakah pekerjaan orang Zaman Logam?','Bagaimanakah manusia Zaman Logam mencari rezeki?'],['logam','ekonomi','pertanian','perdagangan']),
  q('L004','Logam','Mengapakah peralatan logam penting?','Peralatan logam yang sesuai boleh membantu kerja seperti bertani, memotong dan membina.',['Apakah kelebihan alat logam?','Mengapa manusia menggunakan peralatan besi?'],['logam','peralatan','kelebihan','besi']),
  q('L005','Logam','Apakah maksud perdagangan pada Zaman Logam?','Perdagangan ialah kegiatan bertukar atau menjual barangan dengan masyarakat lain.',['Apa itu perdagangan pada Zaman Logam?','Adakah manusia Zaman Logam bertukar barang?'],['logam','perdagangan','pertukaran','barang']),
  q('L006','Logam','Apakah contoh barangan yang diperdagangkan pada Zaman Logam?','Contohnya ialah hasil pertanian, hasil hutan dan barangan buatan manusia.',['Apakah barang dagangan Zaman Logam?','Apa yang boleh ditukar pada Zaman Logam?'],['logam','barang dagangan','hasil pertanian','hutan']),
  q('L007','Logam','Apakah perbezaan alat Neolitik dan alat Zaman Logam?','Zaman Neolitik banyak menggunakan batu yang digilap, manakala Zaman Logam menghasilkan alat daripada logam.',['Bandingkan alat Neolitik dengan Logam.','Bagaimanakah alat berubah pada Zaman Logam?'],['neolitik','logam','perbezaan','alat']),
  q('L008','Logam','Mengapakah manusia Zaman Logam membina petempatan tersusun?','Kehidupan menetap serta kegiatan pertanian dan perdagangan menggalakkan petempatan yang lebih teratur.',['Kenapa petempatan Zaman Logam lebih tersusun?','Apa yang menyebabkan masyarakat Logam menetap?'],['logam','petempatan','tersusun','sebab']),
  q('L009','Logam','Bagaimanakah manusia Zaman Logam menghasilkan alat?','Mereka mempelajari cara membentuk logam untuk menghasilkan peralatan yang diperlukan.',['Bagaimana orang Zaman Logam membuat alat?','Apakah kegiatan pertukangan logam?'],['logam','menghasilkan','pertukangan','alat']),
  q('L010','Logam','Apakah perubahan kehidupan dari Paleolitik hingga Zaman Logam?','Secara beransur-ansur, manusia berubah daripada hidup berpindah-randah dan memburu kepada hidup menetap, bertani dan berdagang.',['Bagaimanakah kehidupan prasejarah berubah mengikut zaman?','Apakah perkembangan empat zaman prasejarah?'],['paleolitik','mesolitik','neolitik','logam','perubahan'])
];

const z = (id: string, era: Era, question: string, options: [string,string,string,string], correctIndex: number, explanation: string): QuizItem => ({id,era,question,options,correctIndex,explanation});
export const seedQuizzes: QuizItem[] = [
  z('Q01','Paleolitik','Manusia Zaman Paleolitik tinggal di mana?',['Pangsapuri','Gua dan kawasan terbuka','Kota batu','Istana'],1,'Gua dan kawasan terbuka menjadi tempat perlindungan.'),
  z('Q02','Paleolitik','Apakah ciri alat batu Paleolitik?',['Kasar dan ringkas','Diperbuat daripada besi','Diperbuat daripada plastik','Berkilat dan moden'],0,'Peralatan pada Zaman Paleolitik umumnya kasar dan ringkas.'),
  z('Q03','Paleolitik','Apakah maksud nomad?',['Hidup di bandar','Berdagang di laut','Berpindah-randah','Menanam padi'],2,'Nomad bermaksud berpindah-randah.'),
  z('Q04','Mesolitik','Apakah makanan yang sering dikumpul di pesisir pantai?',['Kerang','Roti','Coklat','Mi segera'],0,'Masyarakat Mesolitik boleh mengumpulkan kerang.'),
  z('Q05','Mesolitik','Peralatan batu Mesolitik menjadi...',['Lebih besar sahaja','Lebih kecil dan halus','Daripada plastik','Berjentera'],1,'Alat batu Mesolitik lebih kecil dan halus.'),
  z('Q06','Mesolitik','Mengapakah manusia tinggal dekat sungai?',['Untuk menonton televisyen','Untuk menaiki kereta','Untuk membina kilang','Untuk mendapatkan air dan ikan'],3,'Sungai menyediakan air serta sumber makanan.'),
  z('Q07','Neolitik','Apakah kegiatan baharu yang berkembang pada Zaman Neolitik?',['Menonton filem','Menerbangkan kapal terbang','Pertanian dan penternakan','Membuat komputer'],2,'Pertanian dan penternakan menjadi semakin penting.'),
  z('Q08','Neolitik','Apakah kegunaan tembikar?',['Menyimpan makanan dan air','Memasang Internet','Memandu kereta','Menghantar satelit'],0,'Tembikar boleh menyimpan air dan makanan.'),
  z('Q09','Neolitik','Manusia Neolitik mula hidup secara...',['Nomad sepanjang masa','Menetap','Di angkasa','Di atas kapal terbang'],1,'Pertanian menggalakkan hidup secara menetap.'),
  z('Q10','Logam','Apakah bahan yang digunakan untuk membuat alat pada Zaman Logam?',['Kertas','Getah','Kaca sahaja','Gangsa dan besi'],3,'Gangsa dan besi ialah contoh logam yang digunakan.'),
  z('Q11','Logam','Apakah maksud perdagangan?',['Bertukar atau menjual barangan','Tidur dalam gua','Memburu sendirian','Menyalakan api'],0,'Perdagangan melibatkan pertukaran dan jual beli barangan.'),
  z('Q12','Logam','Bagaimanakah petempatan pada Zaman Logam?',['Semua berpindah setiap hari','Lebih tersusun','Hanya atas pokok','Tidak mempunyai kegiatan ekonomi'],1,'Kehidupan menetap menggalakkan petempatan yang lebih tersusun.')
];

export const initialData: AppData = {
  site: DEFAULT_SITE,
  version: 1,
  questions: [...importedQuestions,...seedQuestions],
  quizzes: seedQuizzes,
  settings: {
    name: 'Aki',
    greeting: 'Salam sejahtera, murid-murid. Saya Aki. Mari kita mempelajari Zaman Prasejarah bersama-sama.',
    unknownAnswer: 'Maaf, saya belum mempunyai jawapan yang tepat. Sila kemukakan soalan yang lain.',
    reactions: {
      head: 'Hai! Terima kasih kerana menyapa saya!',
      belly: 'Ha ha! Saya berasa geli apabila disentuh.',
      leftHand: 'Salam sejahtera! Saya gembira dapat bertemu dengan kamu.',
      rightHand: 'Syabas! Mari kita berikan tepukan.',
      feet: 'Lihatlah! Saya boleh melompat dengan gembira.',
      face: 'Adakah kamu suka melihat ekspresi wajah saya?'
    },
    speechRate: 0.92,
    preferredVoice: '',
    size: 425,
    horizontalOffset: 0,
    backgroundImage: '',
    skinColor: '#edb782',
    hairColor: '#553325',
    clothingColor: '#ad7957',
    fullArtwork: '',
    poses: {},
    blink: {leftX:38.7,rightX:58.9,eyeY:31.6,eyeWidth:9,eyeHeight:6.8,color:'#fac29d'},
    mouth: {x:50,y:39.8,width:13,height:6.8},
    layers: {},
    eraDescriptions: {
      Paleolitik: 'Pada Zaman Paleolitik, manusia hidup secara nomad. Mereka memburu haiwan, mengumpul makanan dan menggunakan alat batu yang kasar.',
      Mesolitik: 'Pada Zaman Mesolitik, manusia masih memburu dan mengumpulkan makanan. Mereka juga menangkap ikan dan menggunakan alat batu yang lebih kecil.',
      Neolitik: 'Pada Zaman Neolitik, manusia mula hidup menetap, bercucuk tanam, menternak haiwan dan membuat tembikar.',
      Logam: 'Pada Zaman Logam, manusia menghasilkan alat daripada gangsa dan besi. Pertanian, penternakan serta perdagangan semakin berkembang.'
    }
  }
};
