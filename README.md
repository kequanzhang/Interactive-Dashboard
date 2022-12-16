#欧洲五大联赛可视化分析


项目成员：
刘计羽，张柯权，朱常怡，庄洪森

数据集：
该数据集提供了9,074场比赛，共计来自欧洲最大的5个足球联赛（英格兰，西班牙，德国，意大利，法国）从2011-2012赛季到2016-2017赛季941,009场赛事。我们用到了其中的国家，赛季，主客场，赔率，得分等等。

![9RYL84G~RA4OD}FR7I8TK~9](https://user-images.githubusercontent.com/87868159/205501062-6da4a165-431a-428a-b4aa-d4f2ede7a84e.jpg)
![TB@`8LH{2XS)TZ11J0DZ91A](https://user-images.githubusercontent.com/87868159/205501067-f875bf1d-d8f5-4b40-be71-6892d4dd4c4d.jpg)





积分流动表：
该表显示每个赛季从开始到结束每个球队的积分变化。


每个赛季的胜负平情况图。

对于单个赛季每只球队的进球总数以及丢球总数。

所有比赛的主客场胜率，红色是主场，蓝是平，黄是客场。
![捕获](https://user-images.githubusercontent.com/87868159/208112157-65a8931e-0eda-4a8c-a3a5-4f897a625fdf.PNG)
实现代码如下：
import pandas as pd
from collections import Counter
df=pd.read_csv('C:/Users/25433/Desktop/ginf.csv',encoding='ISO-8859-1')
a=df['abc']
print(Counter(a))
import matplotlib.pyplot as plt
Num = 10112
data=[4649,2890,2573]
labels=['odd_h','odd_a','odd_d']
colors=['red','yellow','blue']
sizes = [data[0]/Num*100,data[1]/Num*100,data[2]/Num*100]
expodes = (0,0,0)
plt.pie(sizes,explode=expodes,labels=labels,shadow=True,colors=colors)
plt.axis('equal')
plt.savefig('pictureep3/fig3.png')
plt.show()


反应所有比赛每场赔率最高的赢是蓝色，最低是红色，中间赔率是黄色。
![捕获(1)](https://user-images.githubusercontent.com/87868159/208112200-0a33d978-1473-4882-82ba-8d2db6fa1477.PNG)
实现代码如下：
import pandas as pd
from collections import Counter
df=pd.read_csv('C:/Users/25433/Desktop/ginf.csv',encoding='ISO-8859-1')
a=df['end_']
a
print(Counter(a))
import matplotlib.pyplot as plt
Num = 10112
data=[5390,2631,2091]
labels=['min','mid','nax']
colors=['red','yellow','blue']
sizes = [data[0]/Num*100,data[1]/Num*100,data[2]/Num*100]
expodes = (0,0,0)
plt.pie(sizes,explode=expodes,labels=labels,shadow=True,colors=colors)
plt.axis('equal')
plt.savefig('pictureep3/fig3.png')
plt.show()


