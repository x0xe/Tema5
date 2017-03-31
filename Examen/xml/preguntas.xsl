<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<head>
<style rel="stylesheet" type="text/css">
html{background-color:lightyellow;font-family:verdana}
table{width:100%;border:2px solid;border-color:blue;}
th{background-color:lightpink}
td,tr,th{border:1px solid;vertical-align:center;border-color:blue}
td{width:33%;background-color:lightblue;font-style:italic}
span.uno{padding-left:5px;color:green}
span.dos{padding-left:5px;color:red}
#x{color:red}
h2{text-align:center;}

</style>
</head>
<body>
  <h2>Examen de acceso a Universidad de Jose (corrección)</h2>
  <table>
    <tr>
      <th>Pregunta</th>
      <th>Opción</th>
      <th>Respuesta</th>
    </tr>
    <xsl:for-each select="questions/question">      
    <tr>
      <td><xsl:value-of select="text"/>
      </td>
      <td>
       <xsl:for-each select="answer">
        <xsl:choose>
         <xsl:when test="../type = 'text'">
          <span ><xsl:value-of select="text()"/></span>
           <span class="uno">&#x2713;</span>
         </xsl:when>
        </xsl:choose>         
       </xsl:for-each>
       <xsl:for-each select="answer">
        <xsl:choose>
         <xsl:when test="../type = 'number'">
          <span><xsl:value-of select="text()"/></span>
          <span class="uno">&#x2713;</span>
         </xsl:when>
        </xsl:choose>         
       </xsl:for-each>

       <xsl:for-each select="option">
         <xsl:variable name="optposition" select="position()-1"/>
         <xsl:value-of select="$optposition+1"/>: <xsl:value-of select="text()"/>
         <xsl:for-each select="../answer">
          <xsl:variable name="correctanswer" select="text()"/>
          <xsl:choose>
          <xsl:when test="$optposition=$correctanswer">
            <span class="uno">&#x2713;</span>
          </xsl:when>
         
        </xsl:choose>
         </xsl:for-each><br/><br/>
       </xsl:for-each>
      </td>

      <td>
       <xsl:for-each select="useranswer">
        <xsl:variable name="useranswer" select="text()"/>
        <xsl:value-of select="text()"/>
        <xsl:for-each select="../answer">
          <xsl:choose>
           <xsl:when test="../type = 'text'">
            <xsl:variable name="correctanswertext" select="text()"/>
            <xsl:if test="$useranswer=$correctanswertext">
              <span>&#x2713;</span>
            </xsl:if>
           </xsl:when>
           <xsl:otherwise>
            <xsl:variable name="correctanswer" select="text()+1"/>
           <xsl:if test="$useranswer=$correctanswer">
              <span>&#x2713;</span>
            </xsl:if>
           </xsl:otherwise>

          </xsl:choose>
         </xsl:for-each>
      
         <br/><br/>
       </xsl:for-each>       
     </td>
    </tr>
    </xsl:for-each>
  </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
