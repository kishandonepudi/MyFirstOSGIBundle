package com.aem;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.Calendar;
import java.util.regex.Pattern;

import javax.jcr.Node;
import javax.jcr.RepositoryException;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.day.cq.commons.jcr.JcrUtil;
import com.day.cq.polling.importer.ImportException;
import com.day.cq.polling.importer.Importer;

@Service(value = Importer.class)
@Component
@Property(name = "importer.scheme", value = "stock", propertyPrivate = true)
public class StockDataImporter implements Importer {

    private final String SOURCE_URL = "http://finance.yahoo.com/d/quotes.csv?f=snd1l1yr&s=";

    private final Logger LOGGER = LoggerFactory.getLogger(StockDataImporter.class);

    @Override
    public void importData(final String scheme, final String dataSource, final Resource resource)
            throws ImportException {
        try {
            // dataSource will be interpreted as the stock symbol
            URL sourceUrl	 = new URL(SOURCE_URL + dataSource);
            BufferedReader in = new BufferedReader(new InputStreamReader(sourceUrl.openStream()));
            String readLine = in.readLine(); // expecting only one line
            String lastTrade = Arrays.asList(Pattern.compile(",").split(readLine)).get(3);
            LOGGER.info("Last trade for stock symbol {} was {}", dataSource, lastTrade);
            in.close();

            //persist
            writeToRepository(dataSource, lastTrade, resource);
        }
        catch (MalformedURLException e) {
            LOGGER.error("MalformedURLException", e);
        }
        catch (IOException e) {
            LOGGER.error("IOException", e);
        }
        catch (RepositoryException e) {
            LOGGER.error("RepositoryException", e);
        }

    }

    private void writeToRepository(final String stockSymbol, final String lastTrade, final Resource resource) throws RepositoryException {
        Node parent = resource.adaptTo(Node.class);
        Node stockPageNode = JcrUtil.createPath(parent.getPath() + "/" + stockSymbol, "cq:Page",
                parent.getSession());
        Node lastTradeNode = JcrUtil.createPath(stockPageNode.getPath() + "/lastTrade", "nt:unstructured",
                parent.getSession());
        lastTradeNode.setProperty("lastTrade", lastTrade);
        lastTradeNode.setProperty("lastUpdate", Calendar.getInstance());
        parent.getSession().save();
    }
}
