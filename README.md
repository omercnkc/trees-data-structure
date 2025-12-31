# TreeLab

Statik HTML/CSS/JS ile hazirlanmis, agac veri yapilarini gorsel olarak ogrenmeye yardimci olan interaktif bir calisma ortamı. BST, AVL, Red-Black, Min Heap, B-Tree, B+ Tree, Trie, Segment ve Fenwick agaclarini ekleme/silme/arama adimlariyla gozlemleyebilir, karmaşıkliklarini ve C++ kod orneklerini inceleyebilirsiniz.

## Ozellikler
- Canvas tabanli animasyonlar ile ekleme, silme, arama, traverse ve (BST icin) dengeli hale getirme
- Tek sayfada agac secimi (sidebar), hiz ayari, rastgele veya hazir veri ekleme, traversal ciktisi
- Her agac icin Big-O karmasiklik tablolari ve kisa aciklamalar
- C++ kod bloğu kopyalama butonu ile temel implementasyon ornekleri
- BST ve AVL icin ayrica karsilastirma tablosu bulunan `comparison.html` sayfasi
- Mobil uyumlu tasarim, sade ve hizli calisan vanilla JS mimarisi

## Proje yapisi
- `index.html`: Ana sayfa, ozellik tanitimi ve agac listesi
- `trees.html`: Asil interaktif ekran (canvas, kontroller, traversal/kod/karmasiklik sekmeleri)
- `comparison.html`: BST vs AVL karsilastirmasi ve kullanim tavsiyeleri
- `assets/css/`: Tasarim degiskenleri, temel stiller ve bilesenler
- `assets/js/core/`: `TreeBase`, `TreeNode`, `TreeFactory` gibi temel siniflar
- `assets/js/trees/`: Her agac turune ait islemler (BST, AVL, Red-Black, MinHeap, BTree, BPlusTree, Trie, Segment, Fenwick)
- `assets/js/visualization/TreeVisualizer.js`: Canvas uzerinde cizim ve vurgulama mantigi
- `assets/js/pages/trees-page.js`: `trees.html` sayfa kontrolcusu; butonlar, sekmeler, URL parametreleri, kopyalama vb.
- `assets/js/utils/EventBus.js`: Basit pub/sub yardimcisi

## Calistirma
Bu proje tamamen statik; paket kurulumuna veya derlemeye ihtiyac yok.
1) Depoyu klonlayin veya ZIP olarak indirin.
2) Dosyalari bir statik sunucuda acin (dogrudan `index.html`e cift tiklamak yeterli, ama tarayici guvenlik kisitlarina takilirsaniz: `python -m http.server 8000`).
3) Tarayicida `http://localhost:8000` adresine gidin ve `index.html` ya da dogrudan `trees.html`i acin.

## Kullanım ipuclari
- `trees.html` acildiginda BST hazir gelir; sidebar'dan baska agac turunu secebilirsiniz. URL'deki `?type=` parametresi de secimi yansitir.
- `Değer Gir` alani uzerinden ekle/sil/ara islemlerini yapin; `Balance` butonu yalnizca BST icin gorunur.
- `Hiz` slider'i animasyonlari yavaslatir/hizlandirir; `Rastgele 5` ve `Ornek` butonlari hizli veri ekler.
- Traversal sekmesinden inorder/preorder/postorder/level order sonucunu gorebilir, Kod sekmesinden C++ ornegini kopyalayabilir, Karmasiklik sekmesinden Big-O tablosunu inceleyebilirsiniz.
- AVL ile BST'yi yan yana gormek icin `comparison.html` sayfasini acin.

## Gelistirme notlari
- Cikti tamamen istemci tarafinda; ek bagimlilik yok ve build adimi gerektirmiyor.
- Moduller vanilla JS ile yazildi; yeni agac turu eklemek icin `assets/js/trees/` altina sinif ekleyip `TreeFactory`ye kaydetmeniz yeterli.
- Canvas boyutlari ve stil ayarlari `assets/css` altindaki token ve bilesen dosyalarinda tutarli hale getirildi.
