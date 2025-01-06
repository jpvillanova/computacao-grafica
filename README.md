<!-- 
####################################################################################################

1) A aplicação deve mostrar uma cena composta por um modelo 3D (veja o link abaixo). O sistema
de coordenadas da cena deve considerar que as coordenadas variam entre -100 e 100.
Bunny: https://www.prinmath.com/csci5229/OBJ/bunny.zip

####################################################################################################

2) O modelo deve ter altura 50, e seu centro de massa deve estar posicionado na origem.

####################################################################################################

3) A cena deve ser vista através de duas câmeras virtuais. A primeira câmera deve utilizar projeção
perspectiva e orbitar em torno da cena. A segunda câmera deve utilizar projeção ortogonal e
observar a origem da cena da posição (50, 50, 50). A alternância das cenas deve ser feita de forma
interativa através de um botão definido na interface.

----------------------------------------------------------------------------------------------------
fazendo -> a projeção das cameras. {quase pronto, apenas os parametros que ainda não entendi}
fazendo -> uma função para orbit da camera. {função pronta, mais ainda não testei}
fazendo -> arrumando a função draw para usar a função orbit. {função implementada mais com os parametros para decidir}
concuido -> definir as projeções das cameras 1 e 2 {ainda sem teste}
começar -> criar a função que faça a aternancia das cenas.
fazendo -> criar e possicionar as cameras 1 e 2 {ainda sem os parametros que são opcionais a decidir}
----------------------------------------------------------------------------------------------------
####################################################################################################

4) A cena deve conter duas fontes de luz (uma branca e outra amarela) posicionadas em (-100, 100,
0) e (100, 100, 0). O modelo de phong deve ser implementado no shader de fragmentos.

####################################################################################################

5) O usuário deverá implementar a estrutura de dados half-edge. Usando a estrutura de dados,
deve-se calcular os triângulos que compõem as orelhas do Bunny e colori-los de vermelho. 

#################################################################################################### 
-->

